var geolocation = require('nativescript-geolocation');
var Accuracy = require('tns-core-modules/ui/enums').Accuracy;
var application = require('tns-core-modules/application');
var device = require('tns-core-modules/platform').device;
var Toast = require('nativescript-toast');

var watchId;
application.on(application.exitEvent, function (args) {
    if (watchId) {
        geolocation.clearWatch(watchId);
    }
});

if (application.android) {
    if (device.sdkVersion < "26") {
        (android.app.Service).extend("com.nativescript.location.BackgroundService", {
            onStartCommand: function (intent, flags, startId) {
                this.super.onStartCommand(intent, flags, startId);
                console.log('Started BG location service');
                return android.app.Service.START_STICKY;
            },
            onCreate: function () {
                var self = this;
                geolocation.enableLocationRequest().then(function () {
                    self.id = geolocation.watchLocation(
                        function (loc) {
                            if (loc) {
                                var toast = Toast.makeText('Background Location: ' + loc.latitude + ' ' + loc.longitude);
                                toast.show();
                            }
                        },
                        function (e) {
                            console.log("Background watchLocation error: " + (e.message || e));
                        },
                        {
                            desiredAccuracy: Accuracy.high,
                            updateDistance: 0.1,
                            updateTime: 3000,
                            minimumUpdateTime: 100
                        });
                }, function (e) {
                    console.log("Background enableLocationRequest error: " + (e.message || e));
                });
            },
            onBind: function (intent) {
                console.log("on Bind Services");
            },
            onUnbind: function (intent) {
                console.log('UnBind Service');
            },
            onDestroy: function () {
                console.log('service onDestroy');
                geolocation.clearWatch(this.id);
            }
        });
    }
    else {
        (android.app).job.JobService.extend("com.nativescript.location.BackgroundService26", {
            onStartJob: function(params) {
                console.log('Started BG location service');
                var executed = false;
                geolocation.enableLocationRequest().then(function () {
                    watchId = geolocation.watchLocation(
                        function (loc) {
                            if (loc) {
                                var toast = Toast.makeText('Background Location: ' + loc.latitude + ' ' + loc.longitude);
                                toast.show();
                            }
                            executed = true;
                        },
                        function (e) {
                            console.log("Background watchLocation error: " + (e.message || e));
                            executed = true;
                        },
                        {
                            desiredAccuracy: Accuracy.high,
                            updateDistance: 0.1,
                            updateTime: 3000,
                            minimumUpdateTime: 100
                        });
                }, function (e) {
                    console.log("Background enableLocationRequest error: " + (e.message || e));
                });

                return executed;
            },

            onStopJob: function() {
                console.log('service onStopJob');
                geolocation.clearWatch(watchId);
                return true;
            },
        });
    }
}