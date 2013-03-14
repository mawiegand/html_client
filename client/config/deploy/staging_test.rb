role :web,       'staging-test.wack-a-doo.de'                          # Your HTTP server, Apache/etc
role :app,       'staging-test.wack-a-doo.de'                          # This may be the same as your `Web` server
role :db,        'staging-test.wack-a-doo.de', :primary => true        # This is where Rails migrations will run

set :port,       22

set :rails_env,  'staging_test'

set :branch,     'staging-test'

set :deploy_to,  '/var/www/html_client_staging_test'
