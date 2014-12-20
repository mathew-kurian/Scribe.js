/*jshint -W079, -W117 */
(function () {

    require('./scribe')();

    var console = process.console;

    console.addLogger('fire');

    console.on('fire', function (log) {
        //call 911
        phone.call911(log.argsString);
    });

    /* .... */

    //Somewhere in your code
    console.tag("Argggg").fire("Need help !");

}());
