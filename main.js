/** Features to add
 * Implement country code, zip code functionality
 * 5 day forecast
 * Maybe a search with multiple results
 */



const Discord = require('discord.js');
const {Client, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const fetch = (...args) =>
import('node-fetch').then(({ default: fetch }) => fetch(...args));

const {
    prefix,
    token,
    key
} = require('./config.json');

const client = new Client({ 
    intents: [    
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel],
});

const icon = new AttachmentBuilder('../WeatherBot/assets/weather-icon.png');

client.once('ready', () =>{
    console.log("Weather Bot is online!");
});

client.on('messageCreate', async message =>{
    if (message.author.bot || !message.content.startsWith(prefix)){
        return; //don't respond to self or non-prefixed messages
    }
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    switch(command){
        case 'w':
        case 'weather':
            execute(message);
            break;
        default:
            break;
    }
})


async function execute(message){
    const args = message.content.split(' ');
    //const type = ; //check if input is country code, zip code, city id, or city name
    if (args.length == 1) {return message.channel.send("Enter the name of a city you wish to know the weather for.")}
    const city = args[1];
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`

    try {
        let response = await fetch(url);
        let data = await response.json();
        //console.log(data);
        if (data.cod != '200'){
            return message.channel.send(`Error code ${data.cod}: ${data.message}`);
        } else {
            const windSpeed = data.wind.speed * 3.6; //convert m/s to km/h

            const report = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`The current weather conditions for ${data.name}, ${data.sys.country} are`)
                //.setAuthor({ name: 'Weather', iconURL: 'attachment://weather-icon.png' })
                .setDescription(`${capitalizeFirstLetter(data.weather[0].description)}`)
                .setThumbnail(`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
                .addFields(
                    { name: 'Current temperature', value: `${data.main.temp}°C`, inline: true},
                    { name: 'Feels like', value: `${data.main.feels_like}°C`, inline: true}, 
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: 'Low', value: `${data.main.temp_min}°C`, inline: true },
                    { name: 'High', value: `${data.main.temp_max}°C`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true},
                    { name: 'Wind speed', value: `${round(windSpeed, 2)} km/h ${getCardinalDirection(data.wind.deg)}`, inline: true },
                    { name: 'Humidity', value: `${data.main.humidity}%`, inline: true },
                    { name: 'Cloudiness', value: `${data.clouds.all}%`, inline: true },
                    { name: 'Sunrise', value: `${new Date(data.sys.sunrise*1000).toLocaleTimeString()}`, inline: true},
                    { name: 'Sunset', value: `${new Date(data.sys.sunset*1000).toLocaleTimeString()}`, inline: true},
                    { name: '\u200B', value: '\u200B', inline: true},
                )
                .setTimestamp()
                .setFooter({ text: 'Data by OpenWeatherMap'});

            return message.channel.send({embeds: [report]});
        }
    } catch (error) {
        console.log(error);
        return message.channel.send(error);
    }
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCardinalDirection(angle) {
    const directions = ['🡡 N', '🡥 NE', '🡢 E', '🡦 SE', '🡣 S', '🡧 SW', '🡠 W', '🡤 NW'];
    return directions[Math.round(angle / 45) % 8];
}
client.login(token);