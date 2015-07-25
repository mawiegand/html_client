role :web, "gs09.wack-a-doo.de"                          # Your HTTP server, Apache/etc
role :app, "gs09.wack-a-doo.de"                          # This may be the same as your `Web` server
role :db,  "gs09.wack-a-doo.de", :primary => true        # This is where Rails migrations will run

set :rails_env, 'production'
set :port, 5775                                            # until 5775 is working!

set :branch,    "round9"
