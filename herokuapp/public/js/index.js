/* global alert, $ */
(function($){
    $(document).ready(function(){
        var _submit;

        $("#submit").click(function(){

            if(_submit){
                return;
            }

            _submit = true;

            var tag = $("#input-tag").val();
            var msg = $("#input-msg").val();

            $.post("/", {
                tag : tag,
                msg : msg
            }, function(/*data*/){
                alert("Message sent");
            }).fail(function(/*err*/) {
                alert( "Message error" );
            }).always(function() {
                _submit = false;
            });
        });
    });
})($);
