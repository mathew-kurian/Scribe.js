(function () {

    //By default, the module access global.console
    //so it doesn't break dependencies logging

    module.exports = {

        saySomething : function (msg) {
            msg = "Without new console - " + msg;
            console.log(msg);
        }

    };

}());
