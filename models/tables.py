# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

db.define_table('post',
                Field('post_author', default=get_user_email()),
                Field('project_id'), 
                Field('post_title'),
                Field('post_content', 'text'),
                Field('post_time', 'datetime', default=get_current_time()),
                )


# Thumbs
db.define_table('thumb',
                Field('user_email'), # The user who thumbed, easier to just write the email here.
                Field('post_id', 'reference post'), # The thumbed post
                Field('thumb_state'), # This can be 'u' for up or 'd' for down, or None for... None.
                )

#Replies
db.define_table('reply',
                Field('post_id', 'reference post'),
                Field('reply_author', default=get_user_email()),
                Field('reply_content', 'text'),
                Field('reply_time', 'datetime', update=get_current_time())
                )



#user profile
db.define_table('usr',
                Field('usr_email', default=get_user_email()),
                Field('usr_name','text'),
                Field('usr_major','text'),
                Field('usr_school','text'),
                Field('usr_experience', 'text'),
                )


# projects
db.define_table('project',
                Field('owner_email'), 
                Field('project_id',),
                Field('project_title','text'), 
                Field('project_posttime', 'datetime', default=get_current_time()),
                Field('project_description','text'),
                Field('project_idea','text'),
                Field('project_plan','text'),
                Field('project_requirement', 'text'),
                Field('project_status'),
                Field('project_field'),
                Field('project_image', 'upload'),
                )

