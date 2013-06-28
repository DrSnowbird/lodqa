require_relative '../lodqaWS'
require 'rspec'
require 'rack/test'

describe 'lodqaWS' do
	include Rack::Test::Methods

	def app
		Sinatra::Application
	end

	it "should show the front page" do
		get '/'
		last_response.should be_ok
	end
end