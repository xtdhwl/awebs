/**
 * Created by xtdhwl on 14-2-28.
 */


enyo.kind({
    name : "aweb.Utils",

    test : function(){
        alert("statics test");
        console.log("statics test");
    },

    statics : {

        test : function(){
            alert("statics test");
            console.log("statics test");
        }
    }
});