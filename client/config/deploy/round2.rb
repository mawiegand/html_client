role :web, "backup-round2.wack-a-doo.de"                          # Your HTTP server, Apache/etc
role :app, "backup-round2.wack-a-doo.de"                          # This may be the same as your `Web` server
role :db,  "backup-round2.wack-a-doo.de", :primary => true        # This is where Rails migrations will run

set :rails_env, 'round2'
set :port, 5775                                            # until 5775 is working!

set :branch,    "backup-round2"

set :deploy_to, "/var/www/html_client_round2"
