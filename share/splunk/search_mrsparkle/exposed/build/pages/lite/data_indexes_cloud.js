!function(modules){function webpackJsonpCallback(data){for(var moduleId,chunkId,chunkIds=data[0],moreModules=data[1],executeModules=data[2],i=0,resolves=[];i<chunkIds.length;i++)chunkId=chunkIds[i],Object.prototype.hasOwnProperty.call(installedChunks,chunkId)&&installedChunks[chunkId]&&resolves.push(installedChunks[chunkId][0]),installedChunks[chunkId]=0;for(moduleId in moreModules)Object.prototype.hasOwnProperty.call(moreModules,moduleId)&&(modules[moduleId]=moreModules[moduleId]);for(parentJsonpFunction&&parentJsonpFunction(data);resolves.length;)resolves.shift()();return deferredModules.push.apply(deferredModules,executeModules||[]),checkDeferredModules()}function checkDeferredModules(){for(var result,i=0;i<deferredModules.length;i++){for(var deferredModule=deferredModules[i],fulfilled=!0,j=1;j<deferredModule.length;j++){var depId=deferredModule[j];0!==installedChunks[depId]&&(fulfilled=!1)}fulfilled&&(deferredModules.splice(i--,1),result=__webpack_require__(__webpack_require__.s=deferredModule[0]))}return result}var installedModules={},installedChunks={26:0},deferredModules=[];function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={i:moduleId,l:!1,exports:{}};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.l=!0,module.exports}__webpack_require__.e=function(chunkId){var promises=[],installedChunkData=installedChunks[chunkId];if(0!==installedChunkData)if(installedChunkData)promises.push(installedChunkData[2]);else{var promise=new Promise((function(resolve,reject){installedChunkData=installedChunks[chunkId]=[resolve,reject]}));promises.push(installedChunkData[2]=promise);var onScriptComplete,script=document.createElement("script");script.charset="utf-8",script.timeout=120,__webpack_require__.nc&&script.setAttribute("nonce",__webpack_require__.nc),script.src=function(chunkId){return __webpack_require__.p+""+({}[chunkId]||chunkId)+".js"}(chunkId);var error=new Error;onScriptComplete=function(event){script.onerror=script.onload=null,clearTimeout(timeout);var chunk=installedChunks[chunkId];if(0!==chunk){if(chunk){var errorType=event&&("load"===event.type?"missing":event.type),realSrc=event&&event.target&&event.target.src;error.message="Loading chunk "+chunkId+" failed.\n("+errorType+": "+realSrc+")",error.name="ChunkLoadError",error.type=errorType,error.request=realSrc,chunk[1](error)}installedChunks[chunkId]=void 0}};var timeout=setTimeout((function(){onScriptComplete({type:"timeout",target:script})}),12e4);script.onerror=script.onload=onScriptComplete,document.head.appendChild(script)}return Promise.all(promises)},__webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.d=function(exports,name,getter){__webpack_require__.o(exports,name)||Object.defineProperty(exports,name,{enumerable:!0,get:getter})},__webpack_require__.r=function(exports){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(exports,"__esModule",{value:!0})},__webpack_require__.t=function(value,mode){if(1&mode&&(value=__webpack_require__(value)),8&mode)return value;if(4&mode&&"object"==typeof value&&value&&value.__esModule)return value;var ns=Object.create(null);if(__webpack_require__.r(ns),Object.defineProperty(ns,"default",{enumerable:!0,value:value}),2&mode&&"string"!=typeof value)for(var key in value)__webpack_require__.d(ns,key,function(key){return value[key]}.bind(null,key));return ns},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,"a",getter),getter},__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)},__webpack_require__.p="",__webpack_require__.oe=function(err){throw console.error(err),err};var jsonpArray=window.webpackJsonp=window.webpackJsonp||[],oldJsonpFunction=jsonpArray.push.bind(jsonpArray);jsonpArray.push=webpackJsonpCallback,jsonpArray=jsonpArray.slice();for(var i=0;i<jsonpArray.length;i++)webpackJsonpCallback(jsonpArray[i]);var parentJsonpFunction=oldJsonpFunction;deferredModules.push([1971,0]),checkDeferredModules()}({1971:function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__.p=function(){function getConfigValue(key,defaultValue){if(window.$C&&window.$C.hasOwnProperty(key))return window.$C[key];if(void 0!==defaultValue)return defaultValue;throw new Error("getConfigValue - "+key+" not set, no default provided")}return function(){for(var seg,len,output="",i=0,l=arguments.length;i<l;i++)(len=(seg=arguments[i].toString()).length)>1&&"/"==seg.charAt(len-1)&&(seg=seg.substring(0,len-1)),"/"!=seg.charAt(0)?output+="/"+seg:output+=seg;if("/"!=output){var segments=output.split("/"),firstseg=segments[1];if("static"==firstseg||"modules"==firstseg){var postfix=output.substring(firstseg.length+2,output.length);output="/"+firstseg,window.$C.BUILD_NUMBER&&(output+="/@"+window.$C.BUILD_NUMBER),window.$C.BUILD_PUSH_NUMBER&&(output+="."+window.$C.BUILD_PUSH_NUMBER),"app"==segments[2]&&(output+=":"+getConfigValue("APP_BUILD",0)),output+="/"+postfix}}var root=getConfigValue("MRSPARKLE_ROOT_PATH","/"),locale=getConfigValue("LOCALE","en-US"),combinedPath="/"+locale+output;return""==root||"/"==root?combinedPath:root+combinedPath}("/static/build/pages/lite")+"/"}(),__WEBPACK_AMD_DEFINE_ARRAY__=[__webpack_require__("require/underscore"),__webpack_require__("routers/IndexesCloud"),__webpack_require__("models/indexes/cloud/Index"),__webpack_require__("util/router_utils")],void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(_,IndexesRouter,IndexModel,router_utils){var createRouter=function(isSingleInstanceCloud,pageError){new IndexesRouter({isSingleInstanceCloud:isSingleInstanceCloud,pageError:pageError});try{router_utils.start_backbone_history()}catch(e){window.location="./"}};(new IndexModel).fetch().then((function(){createRouter(!1,null)})).fail((function(error){404===error.status?createRouter(!0,null):createRouter(!0,error)}))}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)},1972:function(module,exports){module.exports='<td class="index-name">\n    <% if (model.entity.entry.links.get("edit")) { %>\n    <a href=<%- editLink %> class="editAction"><%- model.entity.entry.get("name") %></a>\n    <% } else { %>\n    <span class="disabled-action"><%- model.entity.entry.get("name") %></span>\n    <% } %>\n</td>\n<td class="actions">\n    <% if (model.entity.entry.links.get("edit")) { %>\n        <a href=<%- editLink %> class="editAction"><%= _("Edit").t() %></a>\n    <% } else { %>\n        <span class="disabled-action"><%= _("Edit").t() %></span>\n    <% } %>\n    <% if (isInternal) { %>\n        <span class="disabled-action"><%= _("Delete").t() %></span>\n        <% if (isEnabled) { %>\n            <span class="disabled-action"><%= _("Disable").t() %></span>\n        <% } else { %>\n            <span class="disabled-action"><%= _("Enable").t() %></span>\n        <% } %>\n    <% } else if (isRemoteIndex) { %>\n            <a href="#" class="disabled-action deleteAction"><%= _("Delete").t() %></a>\n            <a href="#" class="disabled-action entity-action"><%= _("Disable").t() %></a>\n    <% } else { %>\n        <% if (isEnabled) { %>\n            <a href="#" class="deleteAction"><%= _("Delete").t() %></a>\n            <a href="#" class="disableAction"><%= _("Disable").t() %></a>\n        <% } else { %>\n            <span class="disabled-action"><%= _("Delete").t() %></span>\n            <a href="#" class="enableAction"><%= _("Enable").t() %></a>\n        <% } %>\n    <% } %>\n</td>\n<td class="index-type">\n    <i class="icon-<%-model.entity.getDataType()%> icon-large"></i>\n    <%- formatDataType(model.entity.getDataType()) %>\n</td>\n<% if (user.canUseApps()) { %>\n<td class="index-app"><%- model.entity.entry.acl.get("app") %></td>\n<% } %>\n<td class="raw-size"><%- formatNumbersUtils.bytesToFileSize(rawSizeSingleInstance * 1024 * 1024) %></td> \x3c!-- format w/ size units --\x3e\n<td class="max-size">\n    <% if (isRemoteIndex) { %>\n        <% if (model.entity.entry.content.get("maxGlobalRawDataSizeMB") == "0") { %>\n            <%- _(\'unlimited\').t() %>\n        <% } else { %>\n            <%- formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("maxGlobalRawDataSizeMB") * 1024 * 1024) %> \x3c!-- format in GB --\x3e\n        <% } %>\n    <% } else { %>\n        <% if (model.entity.entry.content.get("maxTotalDataSizeMB") == "0") { %>\n            <%- _(\'unlimited\').t() %>\n        <% } else { %>\n            <%- formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("maxTotalDataSizeMB") * 1024 * 1024) %>\n        <% } %>\n    <% } %>\n</td> \x3c!-- format in GB --\x3e\n<td class="event-count" title="<%- splunkUtil.sprintf(_(\'%s events\').t(), model.entity.entry.content.get("totalEventCount")) %>"><%- formatNumbersUtils.abbreviateNumber(model.entity.entry.content.get("totalEventCount")) %></td> \x3c!-- Abbreviate number --\x3e\n<td class="earliest-event" title="<%- formatToLocalTime(model.entity.entry.content.get("minTime")) %>"><%- formatToRelativeTime(model.entity.entry.content.get("minTime")) %></td> \x3c!-- format into relative time --\x3e\n<td class="latest-event" title="<%- formatToLocalTime(model.entity.entry.content.get("maxTime")) %>"><%- formatToRelativeTime(model.entity.entry.content.get("maxTime")) %></td>\x3c!-- format into relative time --\x3e\n<td class="searchable-retention" title=\'<%- model.entity.entry.content.get("frozenTimePeriodInSecs") %>\'>\n    <% var frozenTimePeriodInSecs = model.entity.entry.content.get("frozenTimePeriodInSecs");\n       var frozenTimePeriodInSecsDisplay; %>\n    <% if (frozenTimePeriodInSecs == 0) { %>\n        <% frozenTimePeriodInSecsDisplay = _("keep indefinitely").t(); %>\n        <%- frozenTimePeriodInSecsDisplay %>\n    <% } else if (frozenTimePeriodInSecs > 0 && frozenTimePeriodInSecs < 86400) { %>\n        <% frozenTimePeriodInSecsDisplay = timeUtils.getRelativeStringFromSeconds(frozenTimePeriodInSecs, true) %>\n        <%- frozenTimePeriodInSecsDisplay %>\n    <% } else { %>\n        <% frozenTimePeriodInSecsDisplay = timeUtils.secondsToSeparatedDate(frozenTimePeriodInSecs, false); %>\n            <% if(frozenTimePeriodInSecsDisplay === \'keep indefinitely\') { %>\n                <%- frozenTimePeriodInSecsDisplay %>\n            <% } else { %>\n                <% if (frozenTimePeriodInSecsDisplay.years > 0) { %>\n                    <% if (frozenTimePeriodInSecsDisplay.years == 1) { %>\n                            <%- frozenTimePeriodInSecsDisplay.years %> <%= _(\'year\').t() %>   \n                    <% } else { %>\n                            <%- frozenTimePeriodInSecsDisplay.years %> <%= _(\'years\').t() %>\n                    <% } %>\n                <% } %>\n                <% if (frozenTimePeriodInSecsDisplay.days >= 1) { %>\n                    <% if (frozenTimePeriodInSecsDisplay.days == 1) { %>\n                        <%- frozenTimePeriodInSecsDisplay.days %> <%= _(\'day\').t() %>   \n                    <% } else { %>\n                        <%- frozenTimePeriodInSecsDisplay.days %> <%= _(\'days\').t() %>\n                    <% } %>\n                <% } %>\n            <% } %>\n    <% } %>\n</td> \x3c!-- format into relative time --\x3e\n\n<td class="index-status">\n    <div class="status-cell-placeholder"></div>\n</td>\n'},862:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.normalizeBoolean=function(value){switch("string"==typeof value?value.toLowerCase():value){case!0:case 1:case"1":case"yes":case"on":case"true":return!0;case!1:case 0:case"0":case"no":case"off":case"false":return!1;default:return}}},905:function(module,exports){module.exports='<td class="index-name">\n    <% if (isEditableCloud) { %>\n    <a href=<%- editLink %> class="editAction"><%- model.entity.entry.get("name") %></a>\n    <% } else { %>\n    <span class="disabled-action"><%- model.entity.entry.get("name") %></span>\n    <% } %>\n</td>\n<td class="actions">\n    <% if (isEditableCloud) { %>\n    <a href=<%- editLink %> class="editAction"><%= _("Edit").t() %></a>\n    <% } else { %>\n    <span class="disabled-action"><%= _("Edit").t() %></span>\n    <% } %>\n    <% if (isInternal) { %>\n    <span class="disabled-action"><%= _("Delete").t() %></span>\n    <% } else { %>\n    <% if (isEnabled) { %>\n    <a href="#" class="deleteAction"><%= _("Delete").t() %></a>\n    <% } else { %>\n    <span class="disabled-action"><%= _("Delete").t() %></span>\n    <% } %>\n    <% } %>\n    <% if (archiverAppInstalled && hasArchive) { %>\n        <a href="#" class="retrieve-action"><%= _(\'Restore\').t() %></a>\n    <% } %>\n</td>\n<td class="index-type">\n    <i class="icon-<%-model.entity.getDataType()%> icon-large"></i>\n    <%- formatDataType(model.entity.getDataType()) %>\n</td>\n<% if (user.canUseApps()) { %>\n<td class="index-app"><%- model.entity.entry.content.get("eai:acl.appDisplayName") %></td>\n<% } %>\n<td class="raw-size">\n    <% if (isFederatedIndex) { %>\n        <%- _(\'N/A\').t() %>\n    <% } else { %>\n        <%- formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("totalRawSizeMB") * 1024 * 1024) %> \x3c!-- format w/ size units --\x3e\n    <% } %>\n</td>\n<% if (archiverAppInstalled || isRemoteIndex) { %>\n    <td class="max-size">\n        <% if (isFederatedIndex) { %>\n            <%- _(\'N/A\').t() %>\n        <% } else { %>\n            <% if (model.entity.entry.content.has("maxGlobalRawDataSizeMB")) { %>\n                <% if (model.entity.entry.content.get("maxGlobalRawDataSizeMB") == "0") { %>\n                    <%- _(\'unlimited\').t() %>\n                <% } else { %>\n                    <%- formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("maxGlobalRawDataSizeMB") * 1024 * 1024) %> \x3c!-- format in GB --\x3e\n                <% } %>\n                <% if (model.entity.entry.content.has("maxGlobalDataSizeMB") && model.entity.entry.content.get("maxGlobalDataSizeMB") !== "0") { %>\n                    <% var maxGlobalDataSizeMB = formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("maxGlobalDataSizeMB") * 1024 * 1024) %>\n                    <% var maxGlobalRawDataSizeMB = formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("maxGlobalRawDataSizeMB") * 1024 * 1024) %>\n                    <span class="tooltip-link" rel="tooltip" data-title="<%- splunkUtil.sprintf(_(\'Conflicting settings! Disk usage is limited to %s. Raw data size is limited to %s. Splunk recommends you use the Edit action to ensure that only the raw data limit is applied.\').t(), maxGlobalDataSizeMB, maxGlobalRawDataSizeMB) %>" >\n                        <i class="icon-warning icon-large warnIcon"></i>\n                    </span>\n                <% } %>\n            <% } else { %>\n                <% if (model.entity.entry.content.get("maxGlobalDataSizeMB") == "0") { %>\n                    <%- _(\'unlimited\').t() %>\n                <% } else { %>\n                    <%- formatNumbersUtils.bytesToFileSize(model.entity.entry.content.get("maxGlobalDataSizeMB") * 1024 * 1024) %> \x3c!-- format in GB --\x3e\n                <% } %>\n                <span class="tooltip-link" rel="tooltip" data-title="<%= _(\'The maximum size of this index is currently controlled based on disk usage. This is a legacy retention method and we strongly recommend that you reconfigure this limit to be based on raw data size instead, by using the Edit action.\').t() %>" >\n                    <i class="icon-warning icon-large warnIcon"></i>\n                </span>\n            <% } %>\n        <% } %>\n    </td>\n<% } %>\n<td class="event-count" title="<%- splunkUtil.sprintf(_(\'%s events\').t(), model.entity.entry.content.get("totalEventCount")) %>"><%- formatNumbersUtils.abbreviateNumber(model.entity.entry.content.get("totalEventCount")) %></td> \x3c!-- Abbreviate number --\x3e\n<td class="earliest-event" title="<%- timeUtils.convertToLocalTime(model.entity.entry.content.get("minTime")) %>"><%- timeUtils.convertToRelativeTime(model.entity.entry.content.get("minTime")) %></td> \x3c!-- format into relative time --\x3e\n<td class="latest-event" title="<%- timeUtils.convertToLocalTime(model.entity.entry.content.get("maxTime")) %>"><%- timeUtils.convertToRelativeTime(model.entity.entry.content.get("maxTime")) %></td>\x3c!-- format into relative time --\x3e\n<td class="searchable-retention" title=\'<%- model.entity.entry.content.get("frozenTimePeriodInSecs") %>\'>\n    <% var frozenTimePeriodInSecs = model.entity.entry.content.get("frozenTimePeriodInSecs");\n       var frozenTimePeriodInSecsDisplay; %>\n    <% if (frozenTimePeriodInSecs == 0) { %>\n        <% frozenTimePeriodInSecsDisplay = _("keep indefinitely").t(); %>\n        <%- frozenTimePeriodInSecsDisplay %>\n    <% } else if (frozenTimePeriodInSecs > 0 && frozenTimePeriodInSecs < 86400) { %>\n        <% frozenTimePeriodInSecsDisplay = timeUtils.getRelativeStringFromSeconds(frozenTimePeriodInSecs, true) %>\n        <%- frozenTimePeriodInSecsDisplay %>\n    <% } else { %>\n        <% frozenTimePeriodInSecsDisplay = timeUtils.secondsToSeparatedDate(frozenTimePeriodInSecs, false); %>\n            <% if(frozenTimePeriodInSecsDisplay === \'keep indefinitely\') { %>\n                <%- frozenTimePeriodInSecsDisplay %>\n            <% } else { %>\n                <% if (frozenTimePeriodInSecsDisplay.years > 0) { %>\n                    <% if (frozenTimePeriodInSecsDisplay.years == 1) { %>\n                            <%- frozenTimePeriodInSecsDisplay.years %> <%= _(\'year\').t() %>   \n                    <% } else { %>\n                            <%- frozenTimePeriodInSecsDisplay.years %> <%= _(\'years\').t() %>\n                    <% } %>\n                <% } %>\n                <% if (frozenTimePeriodInSecsDisplay.days >= 1) { %>\n                    <% if (frozenTimePeriodInSecsDisplay.days == 1) { %>\n                        <%- frozenTimePeriodInSecsDisplay.days %> <%= _(\'day\').t() %>   \n                    <% } else { %>\n                        <%- frozenTimePeriodInSecsDisplay.days %> <%= _(\'days\').t() %>\n                    <% } %>\n                <% } %>\n            <% } %>\n    <% } %> </td> \x3c!-- format into relative time --\x3e\n\n<% if (archiverAppInstalled) { %>\n    <td class="archive-retention" title=\'<%- _("Archive Retention").t() %>\'>\n      <% if (model.entity.entry.content.get("archiver.coldStorageProvider")) { %>\n        <a target="_blank" href=<%- archiveMgmtLink %>>\n            <%- formatArchiveRetention(model.entity.entry.content.get("archiver.coldStorageRetentionPeriod"))%>\n        </a>\n      <% } %>\n    </td>\n    <td class="self-storage" title=\'<%- _("Self Storage").t() %>\'>\n        <% if (model.entity.entry.content.get("archiver.selfStorageProvider")) { %>\n            <a target="_blank" href=<%- bucketLocationLink %>>\n                <%- archiveBucketExists %>\n            </a>\n        <% } %>\n    </td>\n<% } %>\n\n<td class="index-status">\n    <div class="status-cell-placeholder"></div>\n</td>\n'},"collections/indexes/cloud/Indexes":function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;__WEBPACK_AMD_DEFINE_ARRAY__=[__webpack_require__("require/underscore"),__webpack_require__("models/indexes/cloud/Index"),__webpack_require__("collections/services/data/Indexes"),__webpack_require__("shim/splunk.util")],void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(_,IndexModel,BaseIndexesCollection,splunkUtil){return BaseIndexesCollection.extend({model:IndexModel,url:"cluster_blaster_indexes/sh_indexes_manager",initialize:function(){BaseIndexesCollection.prototype.initialize.apply(this,arguments)}})}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)},"models/indexes/cloud/Archiver":function(module,exports,__webpack_require__){"use strict";__webpack_require__(0),Object.defineProperty(exports,"__esModule",{value:!0});var _extends3=_interopRequireDefault(__webpack_require__(7)),_SplunkDBase2=_interopRequireDefault(__webpack_require__("models/SplunkDBase")),_CloudIndexValidation=__webpack_require__("models/indexes/cloud/CloudIndexValidation"),_underscore2=_interopRequireDefault(__webpack_require__("require/underscore"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}exports.default=_SplunkDBase2.default.extend({url:"cluster_blaster_indexes/sh_indexes_manager",urlRoot:"cluster_blaster_indexes/sh_indexes_manager",defaults:{name:"",datatype:"event",maxIndexSizeFormat:"GB","archiver.coldStorageRetentionPeriod":""},getColdStorageProvider:function(){return"Glacier"},validation:(0,_extends3.default)({},_CloudIndexValidation.validationObj,{"archiver.coldStorageRetentionPeriod":[{fn:function(value,attr,computedState){return"Glacier"!==computedState["archiver.coldStorageProvider"]||value?"":(0,_underscore2.default)("Archive Retention Period is required.").t()}}]})}),module.exports=exports.default},"models/indexes/cloud/CloudIndex":function(module,exports,__webpack_require__){"use strict";__webpack_require__(0),Object.defineProperty(exports,"__esModule",{value:!0});var obj,_Indexes=__webpack_require__("models/services/data/Indexes"),_Indexes2=(obj=_Indexes)&&obj.__esModule?obj:{default:obj},_CloudIndexValidation=__webpack_require__("models/indexes/cloud/CloudIndexValidation");exports.default=_Indexes2.default.extend({validation:_CloudIndexValidation.validationObj}),module.exports=exports.default},"models/indexes/cloud/DynamicDataArchiveConfig":function(module,exports,__webpack_require__){"use strict";(function(fetch){__webpack_require__(0),Object.defineProperty(exports,"__esModule",{value:!0});var _extends3=_interopRequireDefault(__webpack_require__(7)),_classCallCheck3=_interopRequireDefault(__webpack_require__(8)),_createClass3=_interopRequireDefault(__webpack_require__(9)),_fetch=__webpack_require__(39),_url=__webpack_require__(29),_querystring2=_interopRequireDefault(__webpack_require__(41)),_boolean=__webpack_require__(862),_i18n=__webpack_require__(6);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var DynamicDataArchiveConfig=function(){function DynamicDataArchiveConfig(){(0,_classCallCheck3.default)(this,DynamicDataArchiveConfig),this.enablerUrl="data_archive/sh_archive_manager",this.isEnabled=!1,this.maxRetentionPeriod=0,this.error={hasError:!1,message:""},this.isEnabled=!1,this.maxRetentionPeriod=0}return(0,_createClass3.default)(DynamicDataArchiveConfig,[{key:"fetchEnabler",value:function(){return fetch((0,_url.createRESTURL)(this.enablerUrl+"?"+_querystring2.default.encode({output_mode:"json"})),(0,_extends3.default)({},_fetch.defaultFetchInit,{method:"GET"})).then((0,_fetch.handleResponse)(200)).catch((0,_fetch.handleError)((0,_i18n._)("Unable to fetch archive enabler.")))}},{key:"parseConfigSettings",value:function(response){response&&response.entry[0]&&response.entry[0].content&&(this.isEnabled=(0,_boolean.normalizeBoolean)(response.entry[0].content["archiver.enableDataArchive"]),this.maxRetentionPeriod=Number(response.entry[0].content["archiver.maxDataArchiveRetentionPeriod"]),this.error.hasError=!1,this.error.message="")}},{key:"getConfigSettings",value:function(){var _this=this;return this.fetchEnabler().then((function(response){return _this.parseConfigSettings(response)})).catch((function(response){_this.isEnabled=!1,_this.maxRetentionPeriod=0,_this.error.hasError=!0,_this.error.message=response.message}))}}]),DynamicDataArchiveConfig}();exports.default=DynamicDataArchiveConfig,module.exports=exports.default}).call(this,__webpack_require__(36))},"models/indexes/shared/IndexFetchData":function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;__WEBPACK_AMD_DEFINE_ARRAY__=[__webpack_require__("require/underscore"),__webpack_require__("models/shared/EAIFilterFetchData"),__webpack_require__("util/splunkd_utils")],void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(_,EAIFilterFetchData,splunkdUtils){return EAIFilterFetchData.extend({getCalculatedSearch:function(){var searchString=EAIFilterFetchData.prototype.getCalculatedSearch.apply(this,arguments),nameFilter=this.get("nameFilter");return _.isUndefined(nameFilter)||_.isEmpty(nameFilter)||(searchString+=" AND "+splunkdUtils.createSearchFilterString(nameFilter,["name"],{})),""==searchString?searchString="isVirtual=0":""!=searchString&&(searchString+=" AND isVirtual=0"),searchString}})}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)},"models/indexes/shared/NoInternalIndexFetchData":function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;__WEBPACK_AMD_DEFINE_ARRAY__=[__webpack_require__("require/underscore"),__webpack_require__("models/shared/EAIFilterFetchData"),__webpack_require__("util/splunkd_utils")],void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(_,EAIFilterFetchData,splunkdUtils){return EAIFilterFetchData.extend({getCalculatedSearch:function(){var searchString=EAIFilterFetchData.prototype.getCalculatedSearch.apply(this,arguments),nameFilter=this.get("nameFilter");return _.isUndefined(nameFilter)||_.isEmpty(nameFilter)||(searchString+=" AND "+splunkdUtils.createSearchFilterString(nameFilter,["name"],{})),""==searchString?searchString="isVirtual=0":""!=searchString&&(searchString+=" AND isVirtual=0"),searchString+=" AND isInternal=0"}})}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)},"models/services/data/Archiver":function(module,exports,__webpack_require__){"use strict";__webpack_require__(0),Object.defineProperty(exports,"__esModule",{value:!0});var obj,_SplunkDBase=__webpack_require__("models/SplunkDBase"),_SplunkDBase2=(obj=_SplunkDBase)&&obj.__esModule?obj:{default:obj},_CloudIndexValidation=__webpack_require__("models/indexes/cloud/CloudIndexValidation");exports.default=_SplunkDBase2.default.extend({url:"data/archiver",urlRoot:"data/archiver",defaults:{name:"",maxIndexSize:"",maxIndexSizeFormat:"GB",frozenTimePeriodInDays:"","archive.enabled":!1,"archive.provider":"",datatype:"event"},validation:_CloudIndexValidation.validationObj}),module.exports=exports.default},"routers/IndexesCloud":function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;__WEBPACK_AMD_DEFINE_ARRAY__=[__webpack_require__("require/underscore"),__webpack_require__("require/backbone"),__webpack_require__("routers/IndexesBase"),__webpack_require__("models/indexes/cloud/Archiver"),__webpack_require__("models/indexes/cloud/DynamicDataArchiveConfig"),__webpack_require__("models/services/data/Archiver"),__webpack_require__("models/indexes/cloud/Index"),__webpack_require__("models/indexes/cloud/CloudIndex"),__webpack_require__("collections/indexes/cloud/Indexes"),__webpack_require__("collections/services/data/Indexes"),__webpack_require__("collections/indexes/cloud/Archives"),__webpack_require__("models/indexes/shared/IndexFetchData"),__webpack_require__("models/indexes/shared/NoInternalIndexFetchData"),__webpack_require__("views/error/Master"),__webpack_require__("views/indexes/cloud/AddEditIndexDialog"),__webpack_require__("views/indexes/shared/PageController"),__webpack_require__(905),__webpack_require__(1972)],void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(_,Backbone,BaseRouter,ArchiverModel,DynamicDataArchiveConfig,ArchiverSingleInstanceModel,IndexModel,CloudIndexSingleInstanceModel,IndexesCollection,IndexesSingleInstanceCollection,ArchivesCollection,IndexFetchData,IndexSingleInstanceFetchData,ErrorView,AddEditIndexDialog,IndexesController,IndexesGridRowTemplate,IndexesGridRowSingleInstanceTemplate){return BaseRouter.extend({initialize:function(options){BaseRouter.prototype.initialize.apply(this,arguments),this.setPageTitle(_("Manage Indexes").t()),this.isSingleInstanceCloud=!!_.isObject(options)&&!!options.isSingleInstanceCloud,this.pageError=options.pageError},createController:function(model,collection){if(!this.model.user.canEditIndexes()||this.pageError){var status=_("Access Denied").t(),message=_("You do not have permission to view this page.").t();this.pageError&&(status=this.pageError.status+" - "+this.pageError.statusText,message=this.pageError.responseJSON.messages&&this.pageError.responseJSON.messages.length?this.pageError.responseJSON.messages[0].text:this.pageError.statusText);var errorController=new ErrorView({model:{application:this.model.application,error:new Backbone.Model({status:status,message:message})}});return errorController.model.controller=new Backbone.Model,errorController}var archiverModelSingleInstance=this.collection.appLocals.isArchiverAppInstalled()?ArchiverSingleInstanceModel:CloudIndexSingleInstanceModel;return new IndexesController({model:model||this.model,router:this,isCloud:!0,isSingleInstanceCloud:this.isSingleInstanceCloud,collection:collection||this.collection,archivesCollectionClass:ArchivesCollection,dynamicDataArchiveConfig:new DynamicDataArchiveConfig,archiverModelClass:this.isSingleInstanceCloud?archiverModelSingleInstance:ArchiverModel,indexModelClass:this.isSingleInstanceCloud?CloudIndexSingleInstanceModel:IndexModel,indexesCollectionClass:this.isSingleInstanceCloud?IndexesSingleInstanceCollection:IndexesCollection,indexesFetchDataClass:this.isSingleInstanceCloud?IndexSingleInstanceFetchData:IndexFetchData,addEditDialogClass:AddEditIndexDialog,showAppFilter:!1,showConfirmSaveDialog:!this.isSingleInstanceCloud,showConfirmDeleteDialog:!this.isSingleInstanceCloud,templates:{gridRow:this.isSingleInstanceCloud?IndexesGridRowSingleInstanceTemplate:IndexesGridRowTemplate}})}})}.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}});