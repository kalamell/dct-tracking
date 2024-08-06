
// Required functions
const log = require('logToConsole');
const getType = require('getType');
const makeString = require('makeString');
const makeNumber = require('makeNumber');
const getUrl = require('getUrl');
const getReferrerUrl = require('getReferrerUrl');
const readTitle = require('readTitle');
const encodeUriComponent = require('encodeUriComponent');
const sendPixel = require('sendPixel');
const getCookieValues = require('getCookieValues');
const getQueryParameters = require('getQueryParameters');

// Check that the main inputs are valid
if (data.accountId && (getType(data.accountId) === 'number' || getType(data.accountId) === 'string') && makeNumber(data.accountId) > 0) {
  
  // Basic parameters included in every request
  const accountId = makeString(data.accountId);
  const campaignId = data.campaignId ? 
        makeString(data.campaignId) : getQueryParameters('pi_campaign_id', false) ? 
        getQueryParameters('pi_campaign_id', false): '';
  const hostname = data.hostname;
  const host = getUrl('host');
  const protocol = getUrl('protocol');
  const referrer = getReferrerUrl() ? getReferrerUrl() : '';
  const url = getUrl() ? getUrl() : '';
  const title = readTitle() ? readTitle() : '';
  
  // Opt-in parameter
  let piOptIn = data.trackingOptInEnabled ? '': null;
  if (data.trackingOptInEnabled && (data.piOptIn === 'true' || data.piOptIn === true)) {
    piOptIn = 'true';
  } else if (data.trackingOptInEnabled && (data.piOptIn === 'false' || data.piOptIn === false)) {
    piOptIn = 'false';
  }
 
  // Tracking endpoint base URL
  const analyticsHostname = (data.hostname === 'pi.pardot.com' && protocol === 'http') ? 'cdn.pardot.com' : data.hostname;
  const baseUrl = protocol + '://' + analyticsHostname + '/track?';
  
  const commonParams = [
    ['ver', '1'],
    ['campaign_id', campaignId],
    ['account_id', accountId],
    ['title', title],
    ['page_url', url],
    ['host', host],
    ['referrer', referrer]
  ];

  // These parameters are just captured from the current page's URL as they are
  const urlParams = [
    'pi_ad_id',
    'creative',
    'matchtype',
    'keyword',
    'network',
    'pi_profile_id',
    'pi_email',
    'pi_list_email',
    'utm_campaign',
    'utm_medium',
    'utm_source',
    'utm_content',
    'gclid',
    'device'
  ].map(function(param) {
    return [param, getQueryParameters(param, false)];
  });
  
  // Special logic params from page URL
  const specialUrlParams = [
    ['utm_term', getQueryParameters('utm_term', false) ? getQueryParameters('utm_term', false) : getQueryParameters('_kk', false)]
  ];
  
  // Get only the params that have a string value and join them into the payload.
  // Encode the values of the parameters
  const concatParams = commonParams.concat(urlParams).concat(specialUrlParams);
  const hitParams = concatParams.filter(function(param) {
    return getType(param[1]) === 'string';
  }).map(function(param) {
    return param[0] + '=' + encodeUriComponent(param[1]);
  }).join('&');
  
  // Construct the final tracking 
  const trackingUrl = baseUrl + hitParams;
  //log(trackingUrl);
  
  sendPixel(trackingUrl, data.gtmOnSuccess(), data.gtmOnFailure());
}

data.gtmOnFailure();