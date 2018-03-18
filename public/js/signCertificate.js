var CryptoPluginProps = {};
var CryptoPluginStorage;
var CryptoPluginSignCount = {};
var CryptoPluginSignData = {};
var CryptoPluginCertData = {};

function FillCertificateList(isVerify)
{

	if (typeof isInterfaceUzdEvo == 'undefined') isInterfaceUzdEvo = false;
	if (typeof isFactoring == 'undefined') isFactoring = false;
	if (typeof ruSignType == 'undefined' || !ruSignType) ruSignType = 'CADES_BES';
	if (typeof isAllowForeignINNSign == 'undefined') isAllowForeignINNSign = false;
	if (typeof currentGlnOwnership == 'undefined') currentGlnOwnership = false;
	if (typeof jsDebug == 'undefined') jsDebug = false;

	if (CryptoPluginProps.type === 'CryptoProJS') {
		FillCertificateListJS();
	} else {
		_initPlugin();
	}

	function _initPlugin() {
		CryptoProModule.VerifyPlugin().then(function(plugin){
			if (plugin.isLoaded) {
				console.log("КриптоПро ЭЦП Browser plug-in загружен.");
				console.log("Версия плагина: " + plugin.pluginVersion + " " + plugin.pluginType);
				FillCertificateListJS();
				CryptoPluginProps.type = 'CryptoProJS';


                if (isVerify) {
                    var sign = $('#SignTxtBox').val();
                    var data = $('#FileTxtBox').val();

                    CryptoProModule.VerifySignCades(sign, data).then(function (verify) {
                        if (!verify.error) {
                            console.log("Результат провери подписи: " + verify);
                        }
                        else {
                            console.log(verify.error);
                        }
                    });
                }
			}
			else {
				console.log("КриптоПро ЭЦП Browser plug-in не доступен. Error: " + plugin.error);
			}
		});
	}

}

function getCertSelectorArray() {
	var selectorArray = document.getElementsByClassName('cert_selector');
	if (selectorArray.length == 0) {
		var selector = document.getElementById('cert_selector');
		selectorArray = (selector != null)? [selector] : [];
	} else {
        selectorArray = [];
        selectorArray[0] = document.getElementById('cert_selector_0');
        if (document.getElementById('cert_selector_1') != null)
        	selectorArray[1] = document.getElementById('cert_selector_1');
	}
	return selectorArray;
}

function getCertDataArray() {
	var cert_selector_array = getCertSelectorArray();
	var certData = [];

	for (var i = 0; i < cert_selector_array.length; i++) {
		var cert_selector = cert_selector_array[i];
		var selector_object = $(cert_selector.options[cert_selector.selectedIndex]);
		certData[i] = selector_object.data('certData');
		if (typeof certData[i] == 'undefined')
			certData[i] = {};
		else
			delete certData[i].certRaw; // we do need cert body on back end

		var cert_selector_div = $(cert_selector).closest('div');
		certData[i].intRoleID = cert_selector_div.find('.intRoleID').val();
		certData[i].intStatusID = cert_selector_div.find('.intStatusID').val();
		certData[i].varAuthorityReason = cert_selector_div.find('.varAuthorityReason').val();
		certData[i].selectedIndexValue = cert_selector.options[cert_selector.selectedIndex].value; // using this to get Java plugin certificate object
	}

	return certData;
}

/*function SignVerify() {
    var sign = document.getElementById("OutputTxtBox").value;
    var data = StringToBase64(document.getElementById("InputTxtBox").value);
    CryptoProModule.VerifySignCades(sign, data).then(function(verify){
        if (!verify.error) {
            log("Результат провери подписи: " + verify);
        }
        else {
            log(verify.error);
        }
    });
}*/

function CheckCertificateRevoked(certNum, certBody) {
	var certNumber = certNum;
	CryptoPluginStorage[certNumber].revoked = 'pending';
	$.ajax({
		type: "post",
		dataType: 'json',
		url: "signhelp",
		data: ({varCertBody: certBody, '_token': $('meta[name="csrf-token"]').attr('content')}),
		success: function (result) {
			CryptoPluginStorage[certNumber].revoked = (typeof result.revoked == 'undefined')? 'error' : result.revoked;
			if (result.revoked === true) {
				var revokedDate = new Date(result.revokedDate);
				CryptoPluginStorage[certNumber].revokedDate = revokedDate.toLocaleDateString();
			}
			FillCertificateListJS(true);
		}
	});
}

function FillCertificateListJS(forceUpdate) {
	var isTorg12 = CryptoPluginProps.isTorg12;
	var isUZdReg = CryptoPluginProps.isUzdReg;

	if (!CryptoPluginStorage || CryptoPluginStorage == 'error') {
		CryptoPluginStorage = 'loading';
		CryptoProModule.GetCertList().then(function(cert_array){
			if (!cert_array.error) {
				CryptoPluginStorage = cert_array;
				_loadCerts();
			} else {
				CryptoPluginStorage = 'error';
				console.log('Certificate list load error: ' + cert_array.error)
			}
		});
	} else if (CryptoPluginStorage == 'loading') {
		console.log('КриптоПро ЭЦП Browser plug-in загружает список сертификатов...')
	} else {
		_loadCerts();
	}

	function _loadCerts() {
		var selectorArray = getCertSelectorArray();
		for (var i = 0; i < selectorArray.length; i++) {
			_fillCertSelector(selectorArray[i], i == 1);
		}
	}

	function _fillCertSelector(cert_selector, forceAllowForeignINNSign) {
        forceAllowForeignINNSign = (typeof forceAllowForeignINNSign == 'undefined')? false : forceAllowForeignINNSign;

		var cert_selector_val = (cert_selector && cert_selector != null)?cert_selector.value:'';
		if (cert_selector_val != '' && !forceUpdate)
			return; // fill cert_list only if it's empty or force update initiated

		var varGlnInnCode;
		if ($('form')[0].getAttribute('action') == '/gln') {
			varGlnInnCode = $('#varInnCode').val();
		} else if (typeof currentGlnInnCode != 'undefined') {
			varGlnInnCode = currentGlnInnCode;
		}
		var all_certs = CryptoPluginStorage;
		cert_selector.innerHTML = '';
		var validCertsCounter = 0;
		var cert_option;
		var defaultCertNum = false;
		var defaultCertThumb = cert_selector.getAttribute('defaultThumb');
		var allowDisabled = cert_selector.getAttribute('allowDisabled') === 'true';
		var onlyDefaultAllowed = cert_selector.getAttribute('onlyDefaultAllowed') === 'true';
        jsDebug = true;
		for( var cert_num = 0; cert_num < all_certs.length; cert_num++ )
		{
			var cert = all_certs[cert_num];
			var expDate = new Date(cert.dateTo);
			var currDate = new Date();
			var cert_common_name = cert.fname + " " + cert.sname;     //Получаем ФИО из сертификата
			var cert_company_name = cert.cname;	//Получаем название компании из сертификата

			if (isUZdReg) cert.revoked = false; //На странице регистрации эта проверка не нужна

			if (cert.error)
			{
				cert_option = new Option('[Ошибка загрузки сертификата]', cert_num );
				cert_option.setAttribute("disabled", true);
				cert_selector.options.add(cert_option,cert_num);
				continue;
			}
			else if (expDate < currDate)
			{
				cert_option = new Option( cert_common_name + ' [Сертификат просрочен]', cert_num );
				cert_option.setAttribute("disabled", true);
			}
			else if(!cert.hasPrivate)
			{
				cert_option = new Option( cert_common_name + ' [Закрытый ключ не доступен]', cert_num );
				cert_option.setAttribute("disabled", true);
			}
			else if(!isAllowForeignINNSign && !forceAllowForeignINNSign && (parseInt(cert.inn) != parseInt(varGlnInnCode)) && !jsDebug && !isUZdReg)
			{
				cert_option = new Option( cert_common_name + ' [ИНН не совпадает]');
				cert_option.setAttribute("disabled", true);
			}
			else if(typeof cert.revoked == 'undefined')
			{
				cert_option = new Option(cert_common_name + ' [Идет проверка...]', cert_num);
				cert_option.setAttribute("disabled", true);
				CheckCertificateRevoked(cert_num, cert.body);
			}
			else if(cert.revoked == 'pending')
			{
				cert_option = new Option(cert_common_name + ' [Идет проверка...]', cert_num);
				cert_option.setAttribute("disabled", true);
			}
			else if(cert.revoked === true)
			{
				cert_option = new Option(cert_common_name + ' [Отозван ' + cert.revokedDate + ']', cert_num);
				cert_option.setAttribute("disabled", true);
			}
			else if(cert.revoked == 'error')
			{
				cert_option = new Option(cert_common_name + ' [Ошибка верификации]', cert_num);
				cert_option.setAttribute("disabled", true);
			}
			else {
				cert_option = new Option( cert_common_name + ' [' + cert_company_name + ']' + ' [до: ' + expDate.toLocaleDateString() + ']', cert_num );
				validCertsCounter++;
			}
			cert_selector.options.add(cert_option,cert_num);

			if (cert.thumb == defaultCertThumb) {
				if (!cert_option.getAttribute('disabled') || allowDisabled)
					defaultCertNum = cert_num;
			}

			var inn = (currentGlnOwnership == 'fiz' || cert.ogrnip)? cert.inn.slice(-12) : cert.inn.slice(-10);
			var nameData = cert_common_name;
			var position = cert.position;

			if (isTorg12)
			{
				inn = signatory_inn || inn;
				nameData = (signatory_surname && signatory_name)? signatory_surname + ' ' + signatory_name : nameData;
				position = signatory_position || position;
			}

			var certData = {
				nameData: nameData,
				surname: cert.sname,
				firstname: cert.fname,
				allname: cert.fname.split(' ')[0],
				inn: inn,
				ogrn: cert.ogrn,
				ogrnip: cert.ogrnip,
				companyName: cert_company_name,
				position: position,
				positionsign: position,
				email: cert.email,
				issuer: cert.issuer.cname,
				issueDate: cert.dateFrom,
				expireDate: cert.dateTo,
				serial: cert.serial,
				certID: cert.thumb,
				certRaw: cert.body
			};
			var selector_object = $(cert_selector.options[cert_num]);
			selector_object.data('certData', certData);
		}

		if (defaultCertNum !== false) {
			cert_selector.value = defaultCertNum;
		} else if (validCertsCounter == 0) {
			cert_option = new Option('[Нет доступных сертификатов]');
			cert_option.value = -1;
			cert_selector.options.add(cert_option);
		} else if (onlyDefaultAllowed) {
			cert_option = new Option();
			cert_option.value = -1;
			cert_selector.options.add(cert_option);
			cert_selector.value = -1;
		}

		$('#btn_cert_sign').removeAttr('disabled');
		$('.btn_cert_sign').removeAttr('disabled');
		getCertExpInfo(cert_selector);
		fillCertInfo(cert_selector);
		if(isUZdReg)
		{
			$('#' + cert_selector.getAttribute('id')).prepend("<option value='' selected='selected'></option>");
		}
	}
}
function serializeObject (selector)
{
    var ret = {};
    var form = $(selector);
    if ($(form).is('form') && form.length == 1)
    {
        var formArray = $(form).serializeArray();
        for (var i = 0; i < formArray.length; i++)
        {
            ret[formArray[i].name] = formArray[i].value;
        }
    }

    return ret;
}

function CreateDetachedSignFile(url)
{
	//if(!checkSignFormValidation('signForm',url)) return;

	var formData = serializeObject("#signForm");
	var getBodyData;
	var certData = getCertDataArray();
	CryptoPluginSignCount[formData.intFileID] = {};
	CryptoPluginSignCount[formData.intFileID]['max'] = certData.length;
	CryptoPluginSignCount[formData.intFileID]['current'] = 0;
	CryptoPluginSignData[formData.intFileID] = [];
	CryptoPluginCertData[formData.intFileID] = [];

	if (certData.length == 1) {
		getBodyData = $.extend({}, formData, certData[0]);
	} else {
		getBodyData = $.extend({}, formData);
		getBodyData.certData = certData;
	}


	getBodyData.event = 'onGetPdf';
    getBodyData._token = $('meta[name="csrf-token"]').attr('content');
	if (CryptoPluginProps.type === 'CryptoProJS')
		getBodyData.signByHash = true;

	$.ajax({
		//url: '/' + url,
        url: url,
        //url: '/home/signdoc/3',
		type: 'post',
		dataType: 'json',
		data: getBodyData,
		success: function (dataForSign) {

			if (dataForSign == null || (!dataForSign.varHash && !dataForSign.varFileBody)) {
				return;
			}
			formData = $.extend(formData, dataForSign);
			for (var i = 0; i < certData.length; i++) {
				signDataAndSend(dataForSign, formData, certData[i], url);
			}
		}
	});
}

function signDataAndSend(data, form, cert, link) {
    var formData = form;
    var certData = cert;
    var url = link;

    var isHash = data.hasOwnProperty('varHash');
    var dataForSign = isHash ? data.varHash : data.varFileBody;

    CryptoProModule.SignCades(certData.certID, dataForSign, true, ruSignType, isHash).then(function(signature){
        if (!signature.error) {
            _processSignature(signature);
        } else {
            console.log("sign process error: " + signature.error);
            $('#signButtons').show();
            $('#signStatus').hide();
/*            if (isHash)
                setAjaxOnServer('/'+url, { event: 'RemoveTempFileData', dataStore: formData.dataStore }, function(data){});*/
        }
    });

	function _processSignature(signature) {
		console.log("sign successful");
		console.log("ID File PDF: " + formData.intFileID);

		var signIndex = CryptoPluginSignData[formData.intFileID].push(signature) - 1;
		CryptoPluginCertData[formData.intFileID][signIndex] = certData;
		CryptoPluginSignCount[formData.intFileID].current++;

		if (CryptoPluginSignCount[formData.intFileID].current == CryptoPluginSignCount[formData.intFileID].max) {
			var multiSign = (CryptoPluginSignData[formData.intFileID].length > 1);
			var varDsign = (multiSign)? CryptoPluginSignData[formData.intFileID] : CryptoPluginSignData[formData.intFileID][0];

			if (formData.Docs) {
				formData.Docs[formData.intFileID].varDsign = varDsign;
			} else {
				formData.varDsign = varDsign;
			}

			formData.certData = CryptoPluginCertData[formData.intFileID];

			delete CryptoPluginCertData[formData.intFileID];
			delete CryptoPluginSignCount[formData.intFileID];
			delete CryptoPluginSignData[formData.intFileID];

			saveDocumentSign(formData);
		}
	}
}

function saveDocumentSign(formData) {
	console.log(formData);
	$.ajax({
		url: '/home/signdoc',
		dataType: 'json',
		type: 'POST',
		data: formData,
		success: function (requestResult) {
            console.log(requestResult);
            document.location.href = requestResult;
		}
	});
}

function getCertExpInfo(cert_selector)
{
	var selector_object = $(cert_selector.options[cert_selector.selectedIndex]);
	var certData = selector_object.data('certData'); //Get certData array from selector object

	if (typeof certData == 'undefined') return;
	var expDate = new Date(certData.expireDate);
	var currDate = new Date();

	var due = new Date(expDate - currDate),
		dueYear = expDate.getFullYear() - currDate.getFullYear(),
		dueMonth = due.getMonth(),
		dueDay = due.getDate();

	if (dueYear > 0 && ((expDate.getMonth() - currDate.getMonth()) > 0) || dueYear > 0 && ((expDate.getMonth() - currDate.getMonth()) == 0) && ((expDate.getDate() - currDate.getDate()) > 0)) {
		var moreThanYear = true;
	}

	var certExpDays = $(cert_selector).closest('div').find('#certExpDays')[0];
	if (certExpDays && !dueMonth) {
		certExpDays.innerHTML = 'Срок действия сертификата истекает через ' + (moreThanYear ? dueYear + ' год ' : '') + (dueMonth ? dueMonth + ' месяцев ' : '') + dueDay + ' дней. Обратитесь в ваш удостоверяющий центр для продления сертификата.';
	} else if (certExpDays) {
		certExpDays.innerHTML = '';
	}
}

function fillCertInfo(cert_selector)
{
	if ($('.certInfo').length == 0 || cert_selector.value < 0)
		return;

	var selector_object = $(cert_selector.options[cert_selector.selectedIndex]);
	var certData = selector_object.data('certData'); //Get certData array from selector object

    fillCertData(cert_selector, certData);
}

function fillCertData(cert_selector ,certData){
    var i, arrayKey, arrayValue;
    var certDiv = $(cert_selector).closest('div');
    for (i = 0; i < Object.keys(certData).length; i++) {
        arrayKey = Object.keys(certData)[i];
        arrayValue = certData[Object.keys(certData)[i]];
        if (arrayKey.match(/date/i))
            arrayValue = new Date(arrayValue).toLocaleDateString();

        certDiv.find('#' + arrayKey).html(arrayValue);
    }

    certDiv.find('#varThumbprint').val(certData.certID);
    certDiv.find('#varSerialNum').val(certData.serial);
    certDiv.find('#varCert').val(certData.certRaw);
    certDiv.find('#varExpiryDate').val(certData.expireDate);
    certDiv.find('#varMEPPCert').val(certData.body);
}
