role :web,       'testround2.wack-a-doo.de'                          # Your HTTP server, Apache/etc
role :app,       'testround2.wack-a-doo.de'                          # This may be the same as your `Web` server
role :db,        'testround2.wack-a-doo.de', :primary => true        # This is where Rails migrations will run

set :port, 5775

set :rails_env,  'testround2'

set :branch,     'testround2'

set :deploy_to,  '/var/www/html_client_testround2'