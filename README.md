# ec2-state-change-notification-post-to-slack

## Overview

Amazon EC2 state change notification post to Slack.

## Requirement

- Runtime : Node.js 10.x

- This code using slack custom emoji ":aws:" and ":ec2:". Those icon pictures are using AWS Architecture Simple Icon.

- Environment variable

    | key | value |
    |:-----------|:------------|
    | hookUrl | Slack webhook url |
    | slackChannel | target slack channel  |

## Usage

1. Enable AWS CloudTrail.

2. Create Amazon CloudWatch event rule.

    | Event pattern |  |
    |:-----------|:------------|
    | Service Name | EC2 |
    | Event type | EC2 Instance State-change Notification  |
    | State | Any *1 |
    | Instance | Any *1 |
    | Target | Lambda function |

    *1 : Change when specifying a specific state or instance.

3. Create Lambda function with this code.

## Licence

[MIT](https://github.com/mm948/ec2-state-change-notification-post-to-slack/blob/master/LICENSE)

## Author

mm948
