(function () {


    //You can use the new console and all its loggers
    //it's not too far away
    var console = process.console;

    module.exports = {

        saySomething : function (msg) {
            msg = "With new console - " + msg;
            console.myLogger(msg);       //I'm using my custom logger `myLogger`
            //you can still use global.console object if you need to
        }

    };

}());
