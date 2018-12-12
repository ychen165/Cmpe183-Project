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
                    post_author: user_email,
                    // data.post_author,
                    // can_edit: true, //W hether current user has permission to edit post.
                    // editing: false  //Whether post is currently being edited.
                };
                self.vue.post_list.unshift(new_post); //Add new post to front of post_list.
                // We re-enumerate the array.
                self.process_posts();
            }
        );
        // If you put code here, it is run BEFORE the call comes back.
        self.vue.form_set = !self.vue.form_set;
    };



    self.add_usr = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-user"));
        var sent_name = self.vue.usr_name; // Makes a copy 
        var sent_major = self.vue.usr_major; //
        var sent_school = self.vue.usr_school; //
        var sent_experience = self.vue.usr_experience; //
        var sent_email = self.vue.usr_email;


        $.post(add_usr_url,
            // Data we are sending.
            {
                usr_name: self.vue.usr_name,
                usr_major: self.vue.usr_major,
                usr_school: self.vue.usr_school,
                usr_experience: self.vue.usr_experience,
                usr_email: self.vue.usr_email,
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-user"));
                // Clears the form.
                self.vue.usr_name = "";
                self.vue.usr_major = "";
                self.vue.usr_school = "";
                self.vue.usr_experience = "";
                // Adds the post to the list of posts. 
                var new_usr = {
                    id: data.usr_email,
                    usr_name: sent_name,
                    usr_major: sent_major,
                    usr_school: sent_school,
                    usr_experience: sent_experience,
                    usr_email: sent_email,
                    can_edit: true, //Whether current user has permission to edit post.
                    editing: false  //Whether post is currently being edited.
                };
                self.vue.usr_list.unshift(new_usr); //Add new post to front of post_list.
                // We re-enumerate the array.
                self.vue.usrediting = 0;
                self.process_usr();
                self.get_usr();
            }
        );
        

    };


    //My function to add replies. Inspired by the provided add_post function.
    self.add_reply = function(post_idx){
        var p = self.vue.post_list[post_idx];

        reply_content = p._cur_reply;
        $.post(add_reply_url,
        // Data we are sending.
        {
            post_id: p.id,
            reply_content: reply_content
        },
        // What do we do when the post succeeds?
        function (data) {
            p._cur_reply = "";
            var new_reply = {
                id: data.reply_id,
                reply_content: data.reply_content,
                reply_author: data.author,
                editing: false //Whether the reply is currently being edited.
            };

            p._replies.push(new_reply); //Add reply to end of reply list of the associated post.

        });
        p._add_reply = false;
    };


    self.get_posts = function () {
        $.getJSON(get_post_list_url,
            function (data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };

    self.get_usr = function () {
        self.vue.page = 3;
        $.getJSON(get_usr_list_url,
            function (data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.usr_list = data.usr_list;
                // Post-processing.
                self.process_usr();
                console.log("I got my usr profile");
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
            // // If I do e._smile = e.like, then Vue won't sehje the changes to e._smile .
            // Vue.set(e, '_smile', e.like);
            Vue.set(e, '_thumb', e.thumb); //Post's real-time thumb status.
            Vue.set(e, '_show_replies', false); //Boolean for displaying the post's replies.
            Vue.set(e, '_add_reply', false); //Boolean for whether current user can add a reply.
            Vue.set(e, '_cur_reply', ""); //Text of new reply.
            Vue.set(e, '_replies', []); //List of the post's replies.

        });
    };

     self.process_usr = function () {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.usr_list);

        // We initialize the smile status to match the like. 
        self.vue.post_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // The code below is commented out, as we don't have smiles any more. 
            // Replace it with the appropriate code for thumbs. 
            // // Did I like it? 
            // // If I do e._smile = e.like, then Vue won't sehje the changes to e._smile .
            // Vue.set(e, '_smile', e.like);
            // Vue.set(e, '_thumb', e.thumb); //Post's real-time thumb status.
            // Vue.set(e, '_show_replies', false); //Boolean for displaying the post's replies.
            // Vue.set(e, '_add_reply', false); //Boolean for whether current user can add a reply.
            // Vue.set(e, '_cur_reply', ""); //Text of new reply.
            // Vue.set(e, '_replies', []); //List of the post's replies.

        });
    };

    //Toggle the new post form
    self.toggle_form = function () {
        console.log("Form toggle pressed");
        self.vue.form_set = !self.vue.form_set;
    };

    self.toggle_usrform = function () {
        self.vue.usrediting = 1;
    };

    //Thumb up functions
    self.thumb_up_mouseover = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p._thumb = 'u';
    };


    self.thumb_up_mouseout = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p._thumb = p.thumb;
    };


    self.thumb_up_click = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        console.log(p.thumb);
        if (p.thumb == 'u') {
            p.thumb = null;
            console.log(p._thumb_count);
            p._thumb_count -= 1;
        }
        else {
            p.thumb = 'u';
            p._thumb_count += 1;

        }
        $.post(set_thumb_url, {
            post_id: p.id,
            state: p.thumb
        });
        // self.get_thumb_entries();
        console.log('post thumb');
        console.log(p.thumb);
    };


    //Thumb down functions
    self.thumb_down_mouseover = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p._thumb = 'd';
    };


    self.thumb_down_mouseout = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        if (!p._thumb_down_db_entry) {
            p._thumb_down = false;
        }
        p._thumb = p.thumb;
    };


    self.thumb_down_click = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        if (p.thumb == 'd') {
            p.thumb = null;
        }
        else {
            p.thumb = 'd';
        }
        $.post(set_thumb_url, {
            post_id: p.id,
            state: p.thumb
        });
        //self.get_thumb_entries();
        console.log('post thumb');
        console.log(p.thumb);
    };


    //Get all thumb entries for current user session
    self.get_thumb_entries = function () {
        $.getJSON(get_thumb_entries_url, function (data) {
            self.vue.thumb_entries = data.thumb_entries;
        })
    };


    //Determine the db thumb count for post_idx
    self.get_thumb_count = function (post_idx) {
        var count = 0;
        var p = self.vue.post_list[post_idx];

        if (p._thumb == 'u') {
            count++;
        }
        else if (p._thumb == 'd') {
            count--;
        }

        for (var i = 0; i < self.vue.thumb_entries.length; i++) {
            var thumb = self.vue.thumb_entries[i];
            console.log(thumb.id);
            if (thumb.post_id == p.id) {
                if (thumb.thumb_state == 'u') {
                    count++;
                }
                else if (thumb.thumb_state == 'd') {
                    count--;
                }
            }
        }
        return count;
    };


    //Toggle a post's edit button (between edit and submit).
    //When toggling from submit to edit, send the updated post content to the db.
    self.toggle_edit = function(post_idx){
      var p = self.vue.post_list[post_idx];
      console.log(p.can_edit);
      if(p.can_edit){
          if(p.editing){
              //Modify the post's content
            $.post(edit_post_url, {
                post_id: p.id,
                new_content: p.post_content
            });

          }
          p.editing = !p.editing;
      }
    };


    self.show_replies = function(post_idx){
        var p = self.vue.post_list[post_idx];
        //Get all replies associated with p.id
        if(!p._show_replies){
            $.getJSON(get_replies_url,
            // Data we are sending.
            {
                post_id: p.id
            },
            // What do we do when the post succeeds?
            function (data) {
                p._replies = data.reply_list;
            });
        }
        console.log(p._replies);
        p._show_replies = true;
    };


    self.hide_replies = function(post_idx){
        var p = self.vue.post_list[post_idx];
        p._show_replies = false;
    };


    self.toggle_add_reply = function(post_idx){
        var p = self.vue.post_list[post_idx];

        p._add_reply = !p._add_reply;

    };


    self.edit_reply = function(post_idx, reply_id){
        var p = self.vue.post_list[post_idx];
        var r_idx; //index of the reply with reply_id in p's reply list.
        for(r_idx = 0; r_idx < p._replies.length; r_idx++){
            if(p._replies[r_idx].id == reply_id){
                break;
            }
        }

        var r = p._replies[r_idx];

        if(r.editing) {
            r.editing = false;
            console.log("reply idx");
            console.log(r_idx);
            // Modify the reply's content
            $.post(edit_reply_url, {
                reply_id: r.id,
                new_content: r.reply_content
            });
        }
        else{
            r.editing = true;
        }

        p._replies[r_idx] = r;
    };

    self.delete_post = function(post_idx) {
        var p = self.vue.post_list[post_idx];
        $.post(delete_post_url, {
            post_id: p.id,
        },
        function(data) {
            self.vue.post_list.splice(post_idx, 1);
        }

    );
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_set: false, //Boolean for displaying new post form
            add_btn_show: false, //Boolean for displaying add post button
            form_title: "",
            form_content: "",
            usr_name:"",
            usr_major:"",
            usr_school:"",
            usr_experience:"",
            usr_email: "",
            post_list: [],
            usr_list: [],
            page: 0,

            user_email: user_email,

            usrediting:0,

            thumb_entries: [] //List to which get_thumb_entries writes to.

        },
        methods: {
            add_post: self.add_post,
            toggle_form: self.toggle_form,
            thumb_up_mouseover: self.thumb_up_mouseover,
            thumb_up_mouseout: self.thumb_up_mouseout,
            thumb_up_click: self.thumb_up_click,
            thumb_down_mouseover: self.thumb_down_mouseover,
            thumb_down_mouseout: self.thumb_down_mouseout,
            thumb_down_click: self.thumb_down_click,
            get_thumb_count: self.get_thumb_count,
            get_thumb_entries: self.get_thumb_entries,
            toggle_edit: self.toggle_edit,
            show_replies: self.show_replies,
            hide_replies: self.hide_replies,
            toggle_add_reply: self.toggle_add_reply,
            add_reply: self.add_reply,
            edit_reply: self.edit_reply,

            delete_post: self.delete_post,

            add_usr: self.add_usr,
            edit_usr: self.edit_usr,
            toggle_usrform: self.toggle_usrform,
            get_usr: self.get_usr,

        }


    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        // $.web2py.disableElement($("#add-post"));
        self.vue.add_btn_show = true;
        self.vue.page = 1;

        // $("#add_post").show();
    }
    else {
        self.vue.add_btn_show = false;
    }

    // Gets the posts.
    self.get_posts();

    //Get thumb entries for current user session
    self.get_thumb_entries();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});
