# Here go your api methods.


@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
        post_image=request.vars.post_image
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id, post_author=auth.user.email))


@auth.requires_signature()
def add_usr():
    user = db(db.usr.usr_email == auth.user.email).select()
    if len(user) <= 0:
        usr_id = db.usr.insert(
            usr_name=request.vars.usr_name,
            usr_major=request.vars.usr_major,
            usr_school=request.vars.usr_school,
            usr_experience=request.vars.usr_experience,
            usr_email=auth.user.email,
            usr_portrait=request.vars.usr_profile
        )
        # We return the id of the new post, so we can insert it along all the others.
        return response.json(dict(usr_id=usr_id, usr_email=auth.user.email))
    else:
        db(db.usr.usr_email == auth.user.email).update(
            usr_name=request.vars.usr_name,
            usr_major=request.vars.usr_major,
            usr_school=request.vars.usr_school,
            usr_experience=request.vars.usr_experience,
            usr_email=auth.user.email,
            usr_portrait=request.vars.usr_portrait
        )
        return "success"


@auth.requires_signature()
def edit_post():
    # Simply updates content of post associated with post_id.
    post_id = int(request.vars.post_id)
    content = request.vars.new_content
    db(db.post.id == post_id).update(post_content=content)


@auth.requires_signature()
def get_user():
    user = db(db.usr.usr_email == auth.user.email).select()
    if len(user) <= 0:
        return response.json(dict(user=auth.user))
    else:
        return response.json(dict(user=user[0]))


def get_user_by_email():
    user = db(db.usr.usr_email == request.vars.email).select()
    if len(user) <= 0:
        ret = {}
    else:
        ret = user[0]
    return response.json(dict(user=ret))


# @auth.requires_signature()
# def set_thumb():
#     this_post_id = int(request.vars.post_id)
#     this_thumb_state = request.vars.state
#     this_user_email = auth.user.email
#     thumb_id = db.thumb.update_or_insert((db.thumb.post_id == this_post_id) & (db.thumb.user_email == this_user_email),
#                                         post_id = this_post_id,
#                                         thumb_state = this_thumb_state,
#                                         user_email = this_user_email
#                                          )
#     # Return id of the thumb entry
#     return response.json(dict(thumb_id=thumb_id))

def get_usr_list():
    results = []

    rows = db().select(db.usr.ALL)
    for row in rows:
        # editing = False
        # can_edit = False
        # if auth.user is not None:

        results.append(dict(
            # id=row.id,
            usr_name=row.usr_name,
            usr_school=row.usr_school,
            usr_major=row.usr_major,
            usr_experience=row.usr_experience,
            usr_email=row.usr_email,
        ))

    return response.json(dict(usr_list=results))


def get_post_list():
    results = []

    rows = db().select(db.post.ALL, orderby=~db.post.post_time)
    for row in rows:
        # editing = False
        # can_edit = False
        # if auth.user is not None:
        results.append(dict(
            id=row.id,
            post_title=row.post_title,
            post_content=row.post_content,
            post_author=row.post_author,
            post_image=row.post_image
        ))

    # if auth.user is None:
    #     # Not logged in.
    #     rows = db().select(db.post.ALL, orderby=~db.post.post_time)
    #     for row in rows:
    #         results.append(dict(
    #             id=row.id,
    #             post_title=row.post_title,
    #             post_content=row.post_content,
    #             post_author=row.post_author,
    #             thumb = None,
    #             editing = False,
    #             can_edit = False,
    #         ))
    # else:
    #     # Logged in.
    #     rows = db().select(db.post.ALL, db.thumb.ALL,
    #                         left=[
    #                             db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
    #                         ],
    #                         orderby=~db.post.post_time)
    #     for row in rows:
    #         results.append(dict(
    #             id=row.post.id,
    #             post_title=row.post.post_title,
    #             post_content=row.post.post_content,
    #             post_author=row.post.post_author,
    #             thumb = None if row.thumb.id is None else row.thumb.thumb_state,
    #             editing = False,
    #             can_edit = row.post.post_author == auth.user.email
    #         ))
    # For homogeneity, we always return a dictionary.
    # print(results)
    return response.json(dict(post_list=results))


@auth.requires_signature()
def delete_post():
    post_id = int(request.vars.post_id)
    r = db.post(post_id)
    if r is not None:
        if r.post_author != auth.user.email:
            raise (HTTP(403, "Not authorized"))

        r.delete_record()
    return "ok"


# def get_thumb_count():
#     # Get sum of thumbs for specified post.
#     post_id = int(request.vars.post_id)
#     count = 0
#     rows = db(db.thumb.post_id == post_id).select(db.thumb.user_email, db.thumb.thumb_state)

#     for row in rows:
#         # if auth.user.email != row.user_email:
#             if row.thumb_state == 'u':
#                 count += 1
#             elif row.thumb_state == 'd':
#                 count -= 1

#     return response.json(dict(thumb_count=3))


# def get_thumb_entries():
#     if auth.user is None:
#         rows = db().select(db.thumb.ALL)
#     else:
#         rows = db(db.thumb.user_email != auth.user.email).select(db.thumb.ALL)

#     for row in rows:
#         print(row)

#     return response.json(dict(thumb_entries=rows))

@auth.requires_signature()
def edit_post():
    # Simply updates content of post associated with post_id.
    post_id = int(request.vars.post_id)
    content = request.vars.new_content
    db(db.post.id == post_id).update(post_content=content)


@auth.requires_signature()
def add_reply():
    # Add a reply to post associated with post_id.
    post_id = int(request.vars.post_id)
    reply_content = request.vars.reply_content

    reply_id = db.reply.insert(
        post_id=post_id,
        reply_content=reply_content

    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(reply_id=reply_id, reply_content=reply_content, author=auth.user.email))


def get_replies():
    # Get all replies who's post_id equal the passed in post_id.
    results = []
    post_id = int(request.vars.post_id)
    rows = db(db.reply.post_id == post_id).select()

    for row in rows:
        results.append(dict(
            id=row.id,
            reply_content=row.reply_content,
            reply_author=row.reply_author,
            editing=False
        ))

    return response.json(dict(reply_list=results))


@auth.requires_signature()
def edit_reply():
    # Simply updates content of reply associated with reply_id.
    reply_id = int(request.vars.reply_id)
    content = request.vars.new_content
    db(db.reply.id == reply_id).update(reply_content=content)
