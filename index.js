var url = require("url");
var https = require("https");

var postMessage = function (message, callback)
{
    var body = JSON.stringify(message);
    var options = url.parse(process.env["hookUrl"]);

    options.method = "POST";
    options.headers = {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
    };

    var postReq = https.request(options, function (res)
    {
        var chunks = [];
        res.setEncoding("utf8");
        res.on("data", function (chunk)
        {
            return chunks.push(chunk);
        });
        res.on("end", function ()
        {
            var body = chunks.join("");
            if (callback)
            {
                callback({
                    body: body,
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage
                });
            }
        });
        return res;
    });
    postReq.write(body);
    postReq.end();
};

exports.handler = function (event, context)
{
    console.info("start");
    console.log("event", JSON.stringify(event, null, 2));

    // default status
    var icon = ":ec2:";
    var serviceName = "EC2";
    var statusColor = "good";

    // set state color
    switch (event.detail["state"])
    {
        case "running":
            statusColor = "good";
            break;
        case "stopped":
            statusColor = "danger";
            break;
        case "pending":
        case "stopping":
        case "terminated":
            statusColor = "warning";
            break;
        default:
            break;
    }

    //set post message
    var slackMessage = {
        channel: process.env["slackChannel"],
        attachments: [
            {
                color: statusColor,
                text: icon + " *" + serviceName + "*" + "\n",
                fields: [
                    {
                        "title": "Date Time",
                        "value": event.time.toString().replace("-", "/").replace("T", " ").replace("Z", " "),
                        "short": "true"
                    },
                    {
                        "title": "Instance ID",
                        "value": event.detail["instance-id"],
                        "short": "true"
                    },
                    {
                        "title": "Region",
                        "value": event.region,
                        "short": "true"
                    },
                    {
                        "title": "State",
                        "value": event.detail["state"],
                        "short": "true"
                    }
                ]
            }
        ]
    };

    // return param
    var ret;
    var msg;
    
    postMessage(slackMessage, function (response)
    {
        if (response.statusCode < 400)
        {
            msg = "Message posted successfully:" + response.statusCode + "(" + response.statusMessage + ")";
            console.info(msg);
            console.log(msg);
            context.succeed(msg);
        } else if (response.statusCode < 500)
        {
            msg = "Error posting message to Slack API: " + response.statusCode + "(" + response.statusMessage + ")";
            console.error(msg);
            console.log(msg);
            context.fail(msg);
        } else
        {
            msg = "Server error when processing message: " + response.statusCode + "(" + response.statusMessage + ")";
            console.error(msg);
            console.log(msg);
            context.fail(msg);
        }
    });

    ret = {
        body: JSON.stringify(msg),
    };

    return ret;
};

