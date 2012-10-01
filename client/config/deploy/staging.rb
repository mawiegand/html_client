role :web, "test1.wack-a-doo.de"                          # Your HTTP server, Apache/etc
role :app, "test1.wack-a-doo.de"                          # This may be the same as your `Web` server
role :db,  "test1.wack-a-doo.de", :primary => true        # This is where Rails migrations will run

set :rails_env, 'staging'
set :port, 5775
