# Tested on Ruby v.1.9.3 - Author: Fabrizio Calderan, 3.14.2013
#
# Install these gems with
#    $> sudo gem install fastimage nokogiri colorize
#
# Then copy this source into a file named “rakefile” and run with
#    $> rake
#
require "fastimage"
require "nokogiri"
require "colorize"

task :default do

  glob_replace = 0
  file_replace = 0

  # for each .html template in the folder...
  Dir.glob("*.html") do |tpl|

    puts "=> #{tpl.yellow}"

    # read file content...
    html = File.open(tpl, "r").read

    # create a DOM structure...
    document = Nokogiri::HTML(html);

    # for each <img> contained in the structure
    document.css('img').map{ |image|

      # ...find the 'src' attribute...
      url = image['src']

      # ...and if the image exists in the given url
      if File.exist?(url)
      
        # ...compute width and height...
        size = FastImage.size(url)
        puts "\t#{url} (width: #{size[0]}px, height: #{size[1]}px)"
        
        # ...and add width & height attributes
        image['width'] = size[0]
        image['height'] = size[1]
        file_replace += 1
      end
    }

    # then overwrite the template with update document
    File.open(tpl, 'w') { |f|
      f.write(document)
      puts "\n\tSuccessfully updated #{tpl} - #{file_replace} replacements\n".green
      glob_replace += file_replace
      file_replace = 0
    }

  end

  puts "\n\tTotal replacements done: #{glob_replace}".green

end