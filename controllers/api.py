# Here go your api methods.


@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def get_post_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.post.ALL, orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                post_title=row.post_title,
                post_content=row.post_content,
                post_author=row.post_author,
                thumb=None,
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.thumb.ALL,
                           left=[
                               db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                           ],
                           orderby=~db.post.post_time)
        thumbs = db().select(db.thumb.ALL)
        # print(thumbs)
        for row in rows:
            flag = 0
            for t in thumbs:
                if t.post_id == row.post.id:
                    if t.thumb_state == 'd':
                        flag -= 1
                    if t.thumb_state == 'u':
                        flag += 1
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_content=row.post.post_content,
                post_author=row.post.post_author,
                thumb=None if row.thumb.thumb_state is None else row.thumb.thumb_state,
                count=flag
            ))

    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))


@auth.requires_signature()
def set_thumb():
    post_id = int(request.vars.post_id)
    thumb_state = request.vars.thumb_state
    # print(thumb_state)
    if thumb_state == 'u' or thumb_state == 'd':
        db.thumb.update_or_insert(
            (db.thumb.post_id == post_id) & (
                    db.thumb.user_email == auth.user.email),
            post_id=post_id,
            thumb_state=thumb_state,
            user_email=auth.user.email
        )
    else:
        db((db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email)).delete()
        # db(db.thumb.ALL).delete()
    return "ok"  # Might be useful in debugging.


@auth.requires_signature()
def get_reply_list():
    post_id = int(request.vars.post_id)
    data = db(db.reply.post_id==post_id).select(db.reply.ALL, orderby=~db.reply.reply_time)
    print data
    return response.json(dict(reply_list=data))

@auth.requires_signature()
def add_reply():
    post_id = int(request.vars.post_id)
    db.reply.insert(
        post_id = post_id,
        reply_content = request.vars.reply_content,
        reply_author = auth.user.email
    )
    return "ok"

@auth.requires_signature()
def edit_reply():
    reply_id = int(request.vars.id)
    reply_content = request.vars.reply_content
    db(db.reply.id==reply_id).update(
        reply_content=reply_content
    )
    return "ok"

@auth.requires_signature()
def edit_post():
    post_id = int(request.vars.post_id)
    post_title = request.vars.post_title
    post_content = request.vars.post_content

    db(db.post.id==post_id).update(
        post_title=post_title,
        post_content = post_content
    )

    return 'ok'










    
