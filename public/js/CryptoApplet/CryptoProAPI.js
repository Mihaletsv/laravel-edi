;(function () {

    var pluginObject;
    var plugin_resolved = 0;
    var plugin_reject;
    var plugin_resolve;

    var canPromise = !!window.Promise;
    var cadesplugin;

    if(canPromise)
    {
        cadesplugin = new Promise(function(resolve, reject)
        {
            plugin_resolve = resolve;
            plugin_reject = reject;
        });
    } else
    {
        cadesplugin = {};
    }


    function async_spawn(generatorFunc) {
        function continuer(verb, arg) {
            var result;
            try {
                result = generator[verb](arg);
            } catch (err) {
                return Promise.reject(err);
            }
            if (result.done) {
                return result.value;
            } else {
                return Promise.resolve(result.value).then(onFulfilled, onRejected);
            }
        }
        var generator = generatorFunc(Array.prototype.slice.call(arguments, 1));
        var onFulfilled = continuer.bind(continuer, "next");
        var onRejected = continuer.bind(continuer, "throw");
        return onFulfilled();
    }

    function isIE() {
        var retVal = (("Microsoft Internet Explorer" == navigator.appName) || // IE < 11
        navigator.userAgent.match(/Trident\/./i)); // IE 11
        return retVal;
    }

    function isIOS() {
        var retVal = (navigator.userAgent.match(/ipod/i) ||
        navigator.userAgent.match(/ipad/i) ||
        navigator.userAgent.match(/iphone/i));
        return retVal;
    }

    function isChromiumBased()
    {
        var retVal = (navigator.userAgent.match(/chrome/i) ||
        navigator.userAgent.match(/opera/i));
        return retVal;
    }

    // Функция активации объектов КриптоПро ЭЦП Browser plug-in
    function CreateObject(name) {
        if (isIOS()) {
            // На iOS для создания объектов используется функция
            // call_ru_cryptopro_npcades_10_native_bridge, определенная в IOS_npcades_supp.js
            return call_ru_cryptopro_npcades_10_native_bridge("CreateObject", [name]);
        }
        if (isIE()) {
            // В Internet Explorer создаются COM-объекты
            if (name.match(/X509Enrollment/i)) {
                try {
                    // Объекты CertEnroll создаются через CX509EnrollmentWebClassFactory
                    var objCertEnrollClassFactory = document.getElementById("certEnrollClassFactory");
                    return objCertEnrollClassFactory.CreateObject(name);
                }
                catch (e) {
                    throw("Для создания обьектов X509Enrollment следует настроить веб-узел на использование проверки подлинности по протоколу HTTPS");
                }
            }
            // Объекты CAPICOM и CAdESCOM создаются обычным способом
            return new ActiveXObject(name);
        }
        // В Firefox, Safari создаются объекты NPAPI
        return pluginObject.CreateObject(name);
    }

    // Функция активации асинхронных объектов КриптоПро ЭЦП Browser plug-in
    function CreateObjectAsync(name) {
        return pluginObject.CreateObjectAsync(name);
    }

    //Функции для IOS
    var ru_cryptopro_npcades_10_native_bridge = {
        callbacksCount : 1,
        callbacks : {},

        // Automatically called by native layer when a result is available
        resultForCallback : function resultForCallback(callbackId, resultArray) {
            var callback = ru_cryptopro_npcades_10_native_bridge.callbacks[callbackId];
            if (!callback) return;
            callback.apply(null,resultArray);
        },

        // Use this in javascript to request native objective-c code
        // functionName : string (I think the name is explicit :p)
        // args : array of arguments
        // callback : function with n-arguments that is going to be called when the native code returned
        call : function call(functionName, args, callback) {
            var hasCallback = callback && typeof callback == "function";
            var callbackId = hasCallback ? ru_cryptopro_npcades_10_native_bridge.callbacksCount++ : 0;

            if (hasCallback)
                ru_cryptopro_npcades_10_native_bridge.callbacks[callbackId] = callback;

            var iframe = document.createElement("IFRAME");
            var arrObjs = new Array("_CPNP_handle");
            try{
                iframe.setAttribute("src", "cpnp-js-call:" + functionName + ":" + callbackId+ ":" + encodeURIComponent(JSON.stringify(args, arrObjs)));
            } catch(e){
                alert(e);
            }
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        },
    };

    function call_ru_cryptopro_npcades_10_native_bridge(functionName, array){
        var tmpobj;
        var ex;
        ru_cryptopro_npcades_10_native_bridge.call(functionName, array, function(e, response){
            ex = e;
            var str='tmpobj='+response;
            eval(str);
            if (typeof (tmpobj) == "string"){
                tmpobj = tmpobj.replace(/\\\n/gm, "\n");
                tmpobj = tmpobj.replace(/\\\r/gm, "\r");
            }
        });
        if(ex)
            throw ex;
        return tmpobj;
    }

    //Загружаем расширения для Chrome
    function load_chrome_extension(callback)
    {
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", "chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js");
        fileref.onload = function() {
            callback();
        };
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }

    //Загружаем плагин для NPAPI
    function load_npapi_plugin(callback)
    {
        var elem = document.createElement('object');
        elem.setAttribute("id", "cadesplugin_object");
        elem.setAttribute("type", "application/x-cades");
        elem.setAttribute("style", "visibility: hidden");
        document.getElementsByTagName("body")[0].appendChild(elem);
        pluginObject = document.getElementById("cadesplugin_object");
        if(isIE())
        {
            var elem1 = document.createElement('object');
            elem.setAttribute("id", "certEnrollClassFactory");
            elem.setAttribute("classid", "clsid:884e2049-217d-11da-b2a4-000e7bbb2b09");
            elem.setAttribute("style", "visibility: hidden");
            document.getElementsByTagName("body")[0].appendChild(elem1);

        }
    }

    //Отправляем событие что все ок. 
    function plugin_loaded()
    {
        if(canPromise)
        {
            plugin_resolved = 1;
            plugin_resolve();
        }else {
            window.postMessage("cadesplugin_loaded", "*");
        }
    }

    //Отправляем событие что сломались. 
    function plugin_loaded_error(msg)
    {
        if(canPromise)
        {
            plugin_resolved = 1;
            plugin_reject(msg);
        } else {
            window.postMessage("cadesplugin_load_err", "*");
        }
    }

    //проверяем что у нас хоть какое то событие ушло, и если не уходило кидаем еще раз ошибку
    function check_load_timeout()
    {
        if(plugin_resolved == 1)
            return;
        if(canPromise)
        {
            plugin_resolved = 1;
            plugin_reject("Истекло время ожидания загрузки плагина");
        } else {
            window.postMessage("cadesplugin_load_err", "*");
        }

    }

    //Вспомогательная функция для NPAPI
    function createPromise(arg)
    {
        return new Promise(arg);
    }

    function check_npapi_plugin (){
        try {
            var oAbout = CreateObject("CAdESCOM.About");
            plugin_loaded();
        }
        catch (err) {
            // Объект создать не удалось, проверим, установлен ли
            // вообще плагин. Такая возможность есть не во всех браузерах
            var mimetype = navigator.mimeTypes["application/x-cades"];
            if (mimetype) {
                var plugin = mimetype.enabledPlugin;
                if (plugin) {
                    plugin_loaded_error("Плагин загружен, но не создаются обьекты");
                }else
                {
                    plugin_loaded_error("Ошибка при загрузке плагина");
                }
            }else
            {
                plugin_loaded_error("Плагин недоступен");
            }
        }
    }

    //Проверяем работает ли плагин
    function check_plugin_working()
    {
        if(isChromiumBased())
        {
            load_chrome_extension();
            window.postMessage("cadesplugin_echo_request", "*");
            window.addEventListener("message", function (event){
                    if (event.data != "cadesplugin_loaded")
                        return;
                    cpcsp_chrome_nmcades.check_chrome_plugin(plugin_loaded, plugin_loaded_error);
                },
                false);
        }else if(!canPromise) {
            load_npapi_plugin();
            window.addEventListener("message", function (event){
                    if (event.data != "cadesplugin_echo_request")
                        return;
                    check_npapi_plugin();
                },
                false);
        }else
        {
            window.addEventListener("load", function (event) {
                load_npapi_plugin();
                check_npapi_plugin();
            }, false);
        }
    }

    function set_pluginObject(obj)
    {
        pluginObject = obj;
    }

    //Tools
    if (!window.atob) { // Реализация atob() и btoa() для IE
        var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var table = tableStr.split("");

        window.atob = function (base64) {
            if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
            base64 = base64.replace(/=/g, "");
            var n = base64.length & 3;
            if (n === 1) throw new Error("String contains an invalid character");
            for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
                var a = tableStr.indexOf(base64[j++] || "A"), b = tableStr.indexOf(base64[j++] || "A");
                var c = tableStr.indexOf(base64[j++] || "A"), d = tableStr.indexOf(base64[j++] || "A");
                if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
                bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
                bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
                bin[bin.length] = ((c << 6) | d) & 255;
            }
            return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
        };

        window.btoa = function (bin) {
            for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
                var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
                if ((a | b | c) > 255) throw new Error("String contains an invalid character");
                base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
                    (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
                    (isNaN(b + c) ? "=" : table[c & 63]);
            }
            return base64.join("");
        };

    }

    /**
     * Примеры вариантов from можно посмотреть в SubjectName.yml
     * При любых дорабобатках данного метода важно учитывать возможные комбинации этой строки
     * @param from
     * @param what
     * @param unstructuredName
     * @returns {*}
     */
    function extract(from, what, unstructuredName) { // Certificate properties parser
        unstructuredName = (typeof unstructuredName != 'undefined') ? unstructuredName : false;

        var searchTokenPattern = unstructuredName?
            new RegExp('(^| |\/)' + what + '.*', 'g') :
            new RegExp('(^| |,)' + what + '.*', 'g');

        from = from.match(searchTokenPattern);
        if (from == null) return '';
        else from = from[0];

        var begin = from.indexOf(what) + what.length;
        var string = from.substr(begin);

        var nextTokenPattern = unstructuredName?
            /\/([A-Z]+|[А-Я]+|\d+(\.\d+)+|OID\.\d+(\.\d+)+)=/g :
            /,\s?([A-Z]+|([А-Я]\s?)+|\d+(\.\d+)+|OID\.\d+(\.\d+)+)=/g;
        var nextTokens = string.match(nextTokenPattern);

        if (nextTokens) {
            var end = string.indexOf(nextTokens[0]);
            string = string.substr(0, end);
        }

        string = string.replace('""','"');
        string = string.replace('"""','""');
        if (string.substr(0, 1) == '"') string = string.substr(1);
        if (string.substr(string.length - 1) == '"') string = string.substr(0, string.length - 1);

        return string;
    }

    function StringToBase64(string) {
        return window.btoa(unescape(encodeURIComponent(string)));
    }

    function Base64ToString(string) {
        return decodeURIComponent(escape(window.atob(string)));
    }

    function Base64ToBer(string) {
        var hex = '';
        var temp;
        string = atob(string);

        for (var i = 0; i < string.length; i += 1) {
            temp = string.charCodeAt(i).toString(16);
            if (temp.length < 2) temp = "0" + temp;
            if ((i+1) % 2 === 0) {
                if ((i+1) % 16 === 0) hex += temp + "\n";
                else hex += temp + " ";
            }
            else hex += temp;
        }
        return hex;
    }

    function BerToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
                str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
        );
    }

    function Base64isValid(string) {
        string = string.replace(/\r|\n/g, "");
        var base64 = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$");

        if (base64.test(string)) {
            return true;
        } else {
            return false;
        }
    }

    function decimalToHexString(number) {
        if (number < 0) {
            number = 0xFFFFFFFF + number + 1;
        }

        return number.toString(16).toUpperCase();
    }

    function GetErrorMessage(e) {
        var err = e.message;
        if (!err) {
            err = e;
        } else if (e.number) {
            err += " (0x" + decimalToHexString(e.number) + ")";
        }
        return err;
    }

    //Export 
    cadesplugin.JSModuleVersion = "2.0";
    cadesplugin.async_spawn = async_spawn;
    cadesplugin.set = set_pluginObject;

    cadesplugin.extract = extract;
    cadesplugin.StringToBase64 = StringToBase64;
    cadesplugin.Base64ToString = Base64ToString;
    cadesplugin.Base64ToBer = Base64ToBer;
    cadesplugin.BerToBase64 = BerToBase64;
    cadesplugin.Base64isValid = Base64isValid;
    cadesplugin.GetErrorMessage = GetErrorMessage;

    cadesplugin.load_chrome_extension = load_chrome_extension;
    cadesplugin.load_npapi_plugin = load_npapi_plugin;
    cadesplugin.CreateObjectAsync = CreateObjectAsync;
    cadesplugin.CreateObject = CreateObject;

    window.cadesplugin = cadesplugin;
    //check_plugin_working();
}());