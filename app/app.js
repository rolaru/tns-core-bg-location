/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

var application = require("application");
var device = require('tns-core-modules/platform').device;
var tnsCoreUtils = require("tns-core-modules/utils/utils");

require('./bg-location-service');

var backgroundIds = [];

application.on(application.launchEvent, function () {
    if (application.android) {
        var context = tnsCoreUtils.ad.getApplicationContext();
        var intent = new android.content.Intent(context, com.nativescript.location.BackgroundService.class);

        if (device.sdkVersion >= "26") {
            var component = new android.content.ComponentName(context, com.nativescript.location.BackgroundService26.class);
            var builder = new (android.app).job.JobInfo.Builder(1, component);
            builder.setRequiredNetworkType((android.app).job.JobInfo.NETWORK_TYPE_ANY);
            builder.setPeriodic(1000);
            var jobScheduler = context.getSystemService((android.content.Context).JOB_SCHEDULER_SERVICE);
            var service = jobScheduler.schedule(builder.build());
            backgroundIds.push(service);
            console.log('Initialized the background location service (API 26+)...');
            console.log(service)
        } else {
            context.startService(intent);
            console.log('Initialized the background location service (API < 26)...');
        }
    }
});

application.on(application.exitEvent, function () {
    console.log('On exit close job service...');
    if (application.android && backgroundIds.length > 0) {
        var context = utils.ad.getApplicationContext();
        var jobScheduler = context.getSystemService((android.content.Context).JOB_SCHEDULER_SERVICE);
        var service = backgroundIds.pop();
        jobScheduler.cancel(service);
        console.log('Job Canceled: ' + service);
    }
});

application.run({ moduleName: "main-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
