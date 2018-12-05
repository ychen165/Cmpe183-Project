// This is the js for the default/index.html view.
var app = function () {

        var self = {};

        Vue.config.silent = false; // show all warnings

        // Extends an array
        self.extend = function (a, b) {
            for (var i = 0; i < b.length; i++) {
                a.push(b[i]);
            }
        };

        // Enumerates an array.
        var enumerate = function (v) {
            var k = 0;
            return v.map(function (e) {
                e._idx = k++;
            });
        };

        self.add_post = function () {
            // We disable the button, to prevent double submission.
            $.web2py.disableElement($("#add-post"));

            var sent_title = self.vue.form_title; // Makes a copy
            var sent_content = self.vue.form_content; //
            $("#add_post").hide();
            $("#show_form").show();
            $.post(add_post_url,
                // Data we are sending.
                {
                    post_title: self.vue.form_title,
                    post_content: self.vue.form_content
                },
                // What do we do when the post succeeds?
                function (data) {
                    // Re-enable the button.
                    $.web2py.enableElement($("#add-post"));
                    // Clears the form.
                    self.vue.form_title = "";
                    self.vue.form_content = "";
                    // Adds the post to the list of posts.
                    var new_post = {
                        id: data.post_id,
                        post_title: sent_title,
                        post_content: sent_content,
                        count: 0
                    };
                    self.vue.post_list.unshift(new_post);
                    // We re-enumerate the array.
                    self.process_posts();
                    self.get_posts();
                });
            // If you put code here, it is run BEFORE the call comes back.
        };

        self.get_posts = function () {
            $.getJSON(get_post_list_url,
                function (data) {
                    // I am assuming here that the server gives me a nice list
                    // of posts, all ready for display.
                    for (var i in data.post_list) {
                        data.post_list[i].editing = false;
                    }
                    self.vue.post_list = data.post_list;
                    // Post-processing.
                    self.process_posts();
                    console.log("I got my list");
                }
            );
            console.log("I fired the get");
        };

        self.process_posts = function () {
            // This function is used to post-process posts, after the list has been modified
            // or after we have gotten new posts.
            // We add the _idx attribute to the posts.
            enumerate(self.vue.post_list);
            // We initialize the smile status to match the like.
            self.vue.post_list.map(function (e) {
                // I need to use Vue.set here, because I am adding a new watched attribute
                // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
                // The code below is commented out, as we don't have smiles any more.
                // Replace it with the appropriate code for thumbs.
                // // Did I like it?
                // // If I do e._smile = e.like, then Vue won't see the changes to e._smile .
                // Vue.set(e, '_smile', e.like);

                /* modified by Chris */
                // users who thumb up
                Vue.set(e, '_thumbup', e.thumb);
                // // users who thumb down
                Vue.set(e, '_thumbdown', e.thumb);

                Vue.set(e, '_thumbers', []);
                console.log(e.thumb);

            });
        };
        //code for hiding form
        self.display_form = function () {
            if (is_logged_in) {
                $("#add_post").show();
                $("#show_form").hide();
                //$("#vue-div").show();
            }
        };
        // codes for thumbs

        self.thumbup_mouseover = function (post_idx) {
            var p = self.vue.post_list[post_idx];
            p._thumbup = 'm';
        };
        self.thumbdown_mouseover = function (post_idx) {
            var p = self.vue.post_list[post_idx];
            p._thumbdown = 'm';
        };

        self.thumbup_click = function (post_idx) {
            // The like status is toggled; the UI is not changed.
            var p = self.vue.post_list[post_idx];
            // p.thumb = !p.thumb;

            console.log(p.thumb);
            if (p.thumb === 'u') {
                p.thumb = 'null';
                p._thumbdown = 'null';
                p._thumbup = 'null';
                p.count--;
            }
            else {
                if (p.thumb === 'd')
                    p.count += 2;
                else
                    p.count++;
                p.thumb = 'u';
                p._thumbdown = 'u';
                p._thumbup = 'u';
            }

            // We need to post back the change to the server.
            $.post(set_thumb_url, {
                post_id: p.id,
                thumb_state: p.thumb
            }); // Nothing to do upon completion.
        };
        self.thumbdown_click = function (post_idx) {
            // The like status is toggled; the UI is not changed.
            var p = self.vue.post_list[post_idx];
            console.log(p.thumb);
            if (p.thumb === 'd') {
                p.thumb = 'null';
                p._thumbdown = 'null';
                p._thumbup = 'null';
                p.count++;
            }
            else {
                if (p.thumb === 'u')
                    p.count -= 2;
                else
                    p.count--;
                p.thumb = 'd';
                p._thumbdown = 'd';
                p._thumbup = 'd';
            }

            // We need to post back the change to the server.

            $.post(set_thumb_url, {
                post_id: p.id,
                // user_email: auth.user.email,
                thumb_state: p.thumb
            }); // Nothing to do upon completion.
        };

        self.thumbup_mouseout = function (post_idx) {
            var p = self.vue.post_list[post_idx];
            p._thumbup = p.thumb;

        };
        self.thumbdown_mouseout = function (post_idx) {
            var p = self.vue.post_list[post_idx];
            p._thumbdown = p.thumb;
        };

        self.post_reply_click = function(post_idx) {
            if(self.vue.expanded_idx === post_idx){
               self.vue.expanded_idx = -1;
               return;
            }
            self.vue.expanded_idx = post_idx;
            var p = self.vue.post_list[post_idx];
            $.post(get_reply_list_url,{
                post_id:p.id
                },function (data) {
                for(var i in data.reply_list) {
                    var item = data.reply_list[i];
                    item.editing = false;
                }
                self.vue.reply_list = data.reply_list;
            });
            // reply_flag = true;
            // console.log(reply_flag);
        };
        self.reply_submit_click = function(post_idx) {
            var p = self.vue.post_list[post_idx];
            var content = self.vue.reply_content;
            self.vue.reply_content = "";
            $.post(add_reply_url,{
                post_id:p.id, 
                reply_content: content
                },function (data) {
                $.post(get_reply_list_url,{
                    post_id:p.id

                },function (data) {
                    for(var i in data.reply_list) {
                        var item = data.reply_list[i];
                        item.editing = false;
                    }

                    self.vue.reply_list = data.reply_list;
                });
            });

        };
        self.edit_post_click = function(post_idx) {
            var p = self.vue.post_list[post_idx];
            if(p.editing) {
                $.post(edit_post_url, {
                    post_id:p.id, 
                    post_title:p.post_title, 
                    post_content:p.post_content
                },function (data) {
                })
            }
            p.editing = !p.editing;

        };
        self.edit_reply_click = function(reply) {
            if(reply.editing) {
                $.post(edit_reply_url, reply,function () {
                    $.post(get_reply_list_url,{
                        post_id:reply.post_id
                    },function (data) {
                        for(var i in data.reply_list) {
                            var item = data.reply_list[i];
                            item.editing = false;
                        }
                        self.vue.reply_list = data.reply_list;
                    });
                });
            }
            reply.editing = !reply.editing;
        };

// Complete as needed.
        self.vue = new Vue({
            el: "#vue-div",
            delimiters: ['${', '}'],
            unsafeDelimiters: ['!{', '}'],
            data: {
                form_title: "",
                form_content: "",
                post_list: [],
                counter: 0,
                is_logged_in: is_logged_in,
                // reply_flag: false,
                expanded_idx: -1,
                reply_list:[],
                reply_content:'',
                useremail:useremail,
            },
            methods: {
                add_post: self.add_post,
                thumbup_mouseover: self.thumbup_mouseover,
                thumbup_mouseout: self.thumbup_mouseout,
                thumbdown_mouseover: self.thumbdown_mouseover,
                thumbdown_mouseout: self.thumbdown_mouseout,
                thumbup_click: self.thumbup_click,
                thumbdown_click: self.thumbdown_click,
                display_form: self.display_form,

                post_reply_click: self.post_reply_click,
                reply_submit_click: self.reply_submit_click,
                edit_post_click: self.edit_post_click,
                edit_reply_click:self.edit_reply_click,

            }

        });

// If we are logged in, shows the form to add posts.


// Gets the posts.
        self.get_posts();

        return self;
    }
;

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});
