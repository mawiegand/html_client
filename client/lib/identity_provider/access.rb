require 'httparty'

module IdentityProvider

  class Access
    
    def initialize(attributes = {})
      @attributes = attributes
    end

    def fetch_identity(identifier)
      get('/identities/' + identifier)
    end
  
    def obtain_access_token(fb_player_id, fb_access_token=nil)
      body = { fb_player_id: fb_player_id,
               fb_access_token: fb_access_token }
      post("/oauth2/fb_access_token", body)
    end
    
    protected
      
      def post(path, body = {})
        add_client_data(body)
        response = HTTParty.post(@attributes[:identity_provider_base_url] + path,
                                             :body => body, :headers => { 'Accept' => 'application/json'})
        response.parsed_response
      end
  
      def put(path, body = {})
        add_client_data(body)
        HTTParty.put(@attributes[:identity_provider_base_url] + path,
                     :body => body, :headers => { 'Accept' => 'application/json'})
      end
  
      def get(path, query = {})
        add_client_data(query)
        HTTParty.get(@attributes[:identity_provider_base_url] + path,
                     :query => query, :headers => { 'Accept' => 'application/json'})
      end
      
      def add_client_data(query)
        query[:client_id]       = "WACKADOO-FBCANVAS"
        query[:client_password] = "2638-AF67-260D-17AA-FA02"
        query[:grant_type]      = "fb-player-id"
        query[:scope]           = "5dentity"
      end
      
  end
end