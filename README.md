# MMM-timer
[![](https://github.com/luk-schweizer/MMM-timer/actions/workflows/node.js.yml/badge.svg)](https://github.com/luk-schweizer/MMM-timer/actions/workflows/node.js.yml)
[![coverage](https://img.shields.io/endpoint?url=https://api.keyvalue.xyz/f447ef15/coverage)](https://github.com/luk-schweizer/MMM-timer/actions/workflows/node.js.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/luk-schweizer/MMM-timer)](https://github.com/luk-schweizer/MMM-timer/releases/)
<br/><br/>This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror). It adds a Timer that can be controlled by API or Notifications.
The Timer will only be shown while is running. Only one timer can run at a time. Possible actions are start a timer, update and stop a running timer.

![](https://i.imgur.com/j0aZhCV.gif)
   
## Installation
1. Go to your MagicMirror's `modules` folder.
2. Run `git clone https://github.com/luk-schweizer/MMM-timer.git`.

<br/>

## Using the module
Add the module to the configuration file `config/config.js`:
````javascript
modules: [
	{
		module: 'MMM-timer',
		config: {
			timeToHideTimerWhenCompleteMs: 10000
		}
	}
]
````
<br/>

## Configuration options

The following properties can be configured:

<table width="100%">
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>timeToHideTimerWhenCompleteMs</code></td>
			<td>Time in miliseconds that the Timer will remain on screen before being hidden once the Timer finished.<br>
				<br><b>Possible values:</b> <code>int</code>
				<br><b>Default value:</b> <code>10000</code>
			</td>
		</tr>
	</tbody>
</table>

<br/>

## API
The API exposed by the module is: 
```bash
http://{MagicMirrorServerHost}/MMM-timer/timer
```
Where `MagicMirrorServerHost` is the host of the Magic Mirror server or `localhost` if hitting locally.

The following list contains the different HTTP methods that can be used with the API above:

<table width="100%">
	<thead>
		<tr>
			<th>HTTP Method</th>
			<th>Body</th>
			<th>Response</th>
			<th>Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td>
                <code><b>POST</b></code>
            </td>
			<td>
                <code>{timeLimitMs: 1000}</code>
            </td>
            <td>
                <ul>
                    <li><b>200</b> (Request processed): Create successfully </li>
                    <li><b>400</b> (timeLimitMs is undefined): timeLimitMs is not present in the body, request is discarded </li>
                    <li><b>409</b> (A timer is already running): A timer is running, request is discarded </li>
                </ul>
            </td>            
			<td>
                <b>Starts</b> and shows the timer with the specific time limit. No action if a timer is already running.
            </td>
		</tr>
		<tr>
			<td>
                <code><b>PUT</b></code>
            </td>
			<td>
                <code>{timeLimitMs: 2000}</code>
            </td>
            <td>
                <ul>
                    <li><b>200</b> (Request processed): Update successfully </li>
                    <li><b>400</b> (timeLimitMs is undefined): timeLimitMs is not present in the body, request is discarded </li>
                    <li><b>409</b> (A timer is not running): A timer is not running, request is discarded </li>
                </ul>
            </td>            
			<td>
                <b>Updates</b> the running timer with the specific time limit. No action is made if no timer is running.
            </td>
		</tr>
		<tr>
			<td>
                <code><b>DELETE</b></code>
            </td>
			<td>
                <code>none</code>
            </td>
            <td>
                <ul>
                    <li><b>200</b> (Request processed): Delete successfully </li>
                    <li><b>409</b> (A timer is not running): A timer is not running, request is discarded </li>
                </ul>
            </td>            
			<td>
                <b>Stops</b> and hide the running timer with the specific time limit. No action is made if no timer is running.
            </td>
		</tr>				
	</tbody>
</table>

<br/>

## Notifications
List of notifications that the module can handle:
<table width="100%">
	<thead>
		<tr>
			<th>Notification</th>
			<th>Payload</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td>START_TIMER</td>
			<td>
				<code>{timeLimitMs: 1000}</code>
			</td>
			<td>
                Starts and shows the timer with the specific time limit. No action if a timer is already running.
            </td>
		</tr>
		<tr>
			<td>UPDATE_TIMER</td>
			<td>
				<code>{timeLimitMs: 2000}</code>
			</td>
			<td>
                Updates the running timer with the specific time limit. No action is made if no timer is running.
            </td>
		</tr>
		<tr>
			<td>STOP_TIMER</td>
			<td>
				<code>none</code>
			</td>
			<td>
                Stops and hide the running timer with the specific time limit. No action is made if no timer is running.
            </td>
		</tr>				
	</tbody>
</table>
