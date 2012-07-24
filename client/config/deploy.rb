require "bundler/capistrano"

`ssh-add`

default_run_options[:pty] = true                  # problem with ubuntu
set :ssh_options, :forward_agent => true          # ssh forwarding
set :gateway, 'wackadoo.de:5775'

set :application, "html client"
set :repository,  "git@github.com:wackadoo/html_client.git"

set :scm, :git

set :user, "deploy-hc"
set :use_sudo, false

set :deploy_to, "/var/www/html_client"
set :deploy_via, :remote_cache

set :deploy_subdir, "client"

role :web, "wackadoo.de"                          # Your HTTP server, Apache/etc
role :app, "wackadoo.de"                          # This may be the same as your `Web` server
role :db,  "wackadoo.de", :primary => true        # This is where Rails migrations will run

namespace :deploy do
  desc "Restart Thin"
  task :restart, :roles => :app, :except => { :no_release => true } do
    stop
    start
  end

  desc "Start Thin"
  task :start do
    run "cd #{current_path}; bundle exec thin -C config/thin_server.yml start"
  end

  desc "Stop Thin"
  task :stop do
    run "cd #{current_path}; bundle exec thin -C config/thin_server.yml stop"
  end
end
