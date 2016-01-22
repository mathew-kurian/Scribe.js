/* global alert, $ */
(function($) {

    var tid = 0;
    var lastType;

    function notify(type, data) {
        var $notification = $(".notification");
        $notification.removeClass(lastType || "")
            .addClass(lastType = type)
            .find(".text")
            .text(data);

        $notification.addClass("down");

        clearTimeout(tid);
        setTimeout(function() {
            $notification.removeClass("down");
        }, 4000);
    }

    $(document).ready(function() {
        var _submit;

        $("#submit").click(function() {

            if (_submit) {
                return;
            }

            _submit = true;

            var tag = $("#input-tag").val();
            var msg = $("#input-msg").val();

            $.post("/", {
                tag: tag,
                msg: msg
            }, function(data) {
                $("#input-tag").val("");
                $("#input-msg").val("");
                notify("info", data);
            }).fail(function(err) {
                notify("error", err.responseText);
            }).always(function() {
                _submit = false;
            });
        });
    });
})($);
