var CryptoPluginProps = {};
var CryptoPluginStorage;
var CryptoPluginSignCount = {};
var CryptoPluginSignData = {};
var CryptoPluginCertData = {};

function FillCertificateList(isTorg12, isUzdReg)
{
	CryptoPluginProps.isTorg12 = isTorg12 || false;
	CryptoPluginProps.isUzdReg = isUzdReg || false;
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

function CheckCertificateRevoked(certNum, certBody) {
	var certNumber = certNum;
	CryptoPluginStorage[certNumber].revoked = 'pending';
	$.ajax({
		type: "post",
		dataType: 'json',
		url: "RuSignHelper",
		data: ({event: 'VerifyCertCRL', varCertBody: certBody}),
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

function VerifyDetachedSignFile(intDocID)
{
	intDocID = intDocID || $('#intDocID').val();
	$.facebox({ ajax:'RuSignHelper?event=VerifySign&intDocID=' + intDocID }, 'fb-w500 fb-b-tabple-paddings');
}

function VerifySignFactor(intDocID)
{
	intDocID = intDocID || $('#intDocID').val();
	$.facebox({ ajax:'RuSignHelper?event=VerifySign&intDocID=' + intDocID }, 'fb-w500 fb-b-tabple-paddings');
}

function VerifySignAgreement(intAgreementID, signType)
{
	$.facebox({ ajax:'/RuSignHelper?event=VerifySign&intAgreementID='+intAgreementID+'&signType='+signType }, 'fb-w500 fb-b-tabple-paddings');
}

function VerifySignAgreementFactor(intAgreementID, signType)
{
	$.facebox({ ajax:'/factoring/RuSignHelper?event=VerifySign&intAgreementID='+intAgreementID+'&signType='+signType }, 'fb-w500 fb-b-tabple-paddings');
}

function checkSignFormValidation(form_id,type)
{
	var decline_comment = $('#decline_comment');
	if(decline_comment.length > 0 && !decline_comment.hasClass('disableValidation')) {
		var comment = decline_comment.val();
		if(comment == '') {
			if(type == 'torg12') {
				$.ws.addMessage('Укажите, пожалуйста, причину отклонения Торг-12', 'danger');
			}else if(type == 'condra.ticket.prannul') {
				$.ws.addMessage('Укажите, пожалуйста, причину аннулирования Неструкт. документа', 'danger');
			}else{
				$.ws.addMessage('Укажите, пожалуйста, причину отклонения ЭСФ', 'danger');
			}
			return;
		}

		if(comment.length < 10 && type == 'torg12'){
			$.ws.addMessage('Текст причины отклонения Торг-12 не может быть меньше 10 символов', 'danger');
			return;
		}
	}

	var sign_form = $("#"+form_id);
	sign_form.validationEngine({promptPosition: "topRight", scroll: false});
	return sign_form.validationEngine('validate');
}

function getDocumentComment() {
	var comment_val = $('#decline_comment').val();
	var comment;

	if (typeof(comment_val) != 'undefined' && comment_val.length > 0) {
		comment = comment_val;
	} else if (typeof(comment_val) == 'string' && comment_val.length == 0) {
		comment = "";
	} else if ($('.decline_comment').length > 0) {
        comment = {};
        $('.decline_comment').each(
            function (num, el) {
                var commentEl = $(el);
                comment[commentEl.attr('data-trip-number')] = commentEl.val();
            }
        )
	}
	return comment;
}

function CreateDetachedSignFile(url, form_id)
{
	if(!checkSignFormValidation(form_id,url)) return;

	var formData = $.ws.serializeObject("#" + form_id);
	if (typeof(formData.intDocID) == 'undefined' || formData.intDocID == 0)	{
		formData.intDocID = intDocID; // last chance is to find it in global scope;
	}
	if (typeof(formData.event) == 'undefined' || formData.event.length == 0) {
		formData.event = 'sign';
	}

	var getBodyData;
	var certData = getCertDataArray();

	CryptoPluginSignCount[formData.intDocID] = {};
	CryptoPluginSignCount[formData.intDocID]['max'] = certData.length;
	CryptoPluginSignCount[formData.intDocID]['current'] = 0;
	CryptoPluginSignData[formData.intDocID] = [];
	CryptoPluginCertData[formData.intDocID] = [];

	if (certData.length == 1) {
		getBodyData = $.extend({}, formData, certData[0]);
	} else {
		getBodyData = $.extend({}, formData);
		getBodyData.certData = certData;
	}

	getBodyData.event = 'GetXMLbody';
	getBodyData.comment = getDocumentComment();

	if (CryptoPluginProps.type === 'CryptoProJS')
		getBodyData.signByHash = true;

	$.ajax({
		url: '/' + url,
		type: 'post',
		dataType: 'json',
		data: getBodyData,
		success: function (dataForSign) {
			$.ws.defaultAjaxSuccess(dataForSign);
			if (dataForSign == null || typeof(dataForSign[0]) == 'undefined' || (!dataForSign[0].varHash && !dataForSign[0].varXml)) {
                if (dataForSign == null || typeof dataForSign.messages == 'undefined' || dataForSign.messages == null)
                    $.ws.addErrorMessage('Ошибка формирования тела документа.');
				return;
			}

			formData = $.extend(formData, dataForSign[0]);

			for (var i = 0; i < certData.length; i++) {
				signDataAndSend(dataForSign[0], formData, certData[i], url);
			}
		}
	});
}

function signDataAndSend(data, form, cert, link) {
    var formData = form;
    var certData = cert;
    var url = link;
    var isHash = data.hasOwnProperty('varHash');
    var dataForSign = isHash ? data.varHash : data.varXml;

    CryptoProModule.SignCades(certData.certID, dataForSign, true, ruSignType, isHash).then(function(signature){
        if (!signature.error) {
            _processSignature(signature);
        } else {
            console.log("sign process error: " + signature.error);
            $.ws.addErrorMessage('Ошибка подписания: ' + signature.error);
            $('#signButtons').show();
            $('#signStatus').hide();
            if (isHash)
                setAjaxOnServer('/'+url, { event: 'RemoveTempFileData', dataStore: formData.dataStore }, function(data){});
        }
    });

	function _processSignature(signature) {
		console.log("sign successful");
		console.log("intDocID: " + formData.intDocID);

		var signIndex = CryptoPluginSignData[formData.intDocID].push(signature) - 1;
		CryptoPluginCertData[formData.intDocID][signIndex] = certData;
		CryptoPluginSignCount[formData.intDocID].current++;

		if (CryptoPluginSignCount[formData.intDocID].current == CryptoPluginSignCount[formData.intDocID].max) {
			var multiSign = (CryptoPluginSignData[formData.intDocID].length > 1);
			var varDsign = (multiSign)? CryptoPluginSignData[formData.intDocID] : CryptoPluginSignData[formData.intDocID][0];

			if (formData.Docs) {
				formData.Docs[formData.intDocID].varDsign = varDsign;
			} else {
				formData.varDsign = varDsign;
			}

			formData.certData = CryptoPluginCertData[formData.intDocID];

			delete CryptoPluginCertData[formData.intDocID];
			delete CryptoPluginSignCount[formData.intDocID];
			delete CryptoPluginSignData[formData.intDocID];

			saveDocumentSign(url, formData);
		}
	}
}

function hideSendSFButton()
{
	//hide sign button
	var btn_cert_sign = $('#btn_cert_sign');

	if(btn_cert_sign.length > 0)
	{
		btn_cert_sign.hide();
		$('#cert_selector').hide();
		$('#cert_selector_text').hide();
		$('#callout_sfsent').show();
		$('.form_control').attr('disabled', "true");
	}

	if($('#dp-tripspec-form').length)
	{
		$('#action_selector').hide();
		$('#headers_table').find('input').each(function(){
			$(this).replaceWith($(this).val());
		});
	}

	$('#docRecallButton').hide();
	$('#docRecallTransactionSignBlock').hide();
}

function saveDocumentSign(url, formData) {
	$.ajax({
		url: '/'+url,
		dataType: 'json',
		type: 'POST',
		data: formData,
		success: function (requestResult) {
			exTask.status.done(formData.intDocID);
			$.ws.defaultAjaxSuccess(requestResult);

			var hasErrorProp = false;
			if (requestResult != null && requestResult.hasOwnProperty('messages')) {
				for (var i = 0; i < requestResult.messages.length; i++) {
					hasErrorProp = requestResult.messages[i].hasOwnProperty('error');
				}
			}

			if (!hasErrorProp && !formData.isRefresh) {
				$('#button_send').show();
				$('#button_sendUop').show();
				hideSendSFButton();
                $.facebox.close();
			}
		}, error: function (requestResult) {
			exTask.status.error(formData.intDocID);
			$.ws.defaultAjaxSuccess(requestResult);
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

// ------------------------------------------------- Mass sign & send --------------------------------------------------

function SignAndSendSelectedDocs(sendOneByOne) {
	SignSelectedDocs(true, sendOneByOne);
}

function SignSelectedDocs(isSend, sendOneByOne, isSendUvutouch, varSendDatetime) {
	isSend = isSend || false;
    sendOneByOne = sendOneByOne || false;
    isSendUvutouch = isSendUvutouch || false;
    varSendDatetime = varSendDatetime || false;
	var intDocID, i, j;

    exTask.config.maxInProgressTasks = sendOneByOne ? 1 : 3;

    if (typeof CryptoPluginStorage == 'undefined' || CryptoPluginStorage == 'loading') {
		$.ws.addMessage('Модуль криптографии загружается...');
		return;
	}
	else if (CryptoPluginStorage == 'error') {
		$.ws.addErrorMessage('Ошибка загрузки модуля криптографии.');
		return;
	}

	// Валидация формы, если кнопка вызвана со страницы подписания документа
	var formID = $('#signAndSendButton').attr('formID');
	if (typeof formID == 'string') {
		if (!checkSignFormValidation(formID,null))
			return;
	}

	var certData = getCertDataArray();

	for (j = 0; j < certData.length; j++) {
		if (certData[j].selectedIndexValue < 0) {
			$.ws.addErrorMessage(
				'Настройки подписания не заданы, либо указанный сертификат недоступен.<br>' +
				'<a href="#/gln?intGlnID='+ currentGlnID +'&tab_index=2&label=ru-sign-settings"><b>Перейти к настройкам...<b></a>'
			);
			return;
		}
	}

    // Кнопки при использовании метода на форме создания документа
	$('#signButtons').hide();
    $('#signStatus').show();

    // Массив документов и соответствующих статусов, для которых требуется заполнения дополнительных данных
    var formDataDocTypesSubStatus = {
    	'updsfaktdop' : 8,
		'upddop' : 8,
		'ukdsfaktdis': 8,
		'ukddis': 8
	};

    var isTaskRun = true, docType, intSubStatusID;
	$('.chain').filter(':checked').each(function()
	{
        docType = $(this).attr('data-doctype');
        intDocID = $(this).attr('data-docid');
        intSubStatusID = $(this).attr('data-substatus');

		// Отображение формы заполнения дополнительных данных для массового подписания
        if (formDataDocTypesSubStatus.hasOwnProperty(docType) &&
			formDataDocTypesSubStatus[docType] == intSubStatusID &&
			!$(this).data('formData') &&
			!isSendUvutouch) {

            $.facebox({ ajax: docType + '?event=GetDocumentAnswerForm'});

            $(document).one('close.facebox', function () {
                $('.formError').hide();});

            isTaskRun = false;
            return false; // break
		}

		// Подписание двумя подписями доступно только для ряда документов в черновиках
		if (['updsfaktdop', 'ukdsfaktdis'].indexOf(docType) < 0 || (intSubStatusID))
            certData = [certData[0]];

        var taskProperty = {
            name: 'Подписание документа. Тип="'+docType+'". <a class="task_doc_url" href="/#/'+docType+'?intDocID='+intDocID+'">Открыть</a>',
            doctype: docType,
            certData: certData,
            formData: $(this).data('formData'),
            isSend: isSend,
			sendDeferral: varSendDatetime
		};

        exTask.put(intDocID, SingTask, taskProperty);
	});

    if (isTaskRun) exTask.run();
}

function SingTask(id, properties) {
	var intDocID = id;
	var props = properties;
	var signByHash = (CryptoPluginProps.type == 'CryptoProJS');

	var formData = {
		intDocID: intDocID,
		event: (props.isSend) ? 'saveSignsAndSend' : 'saveDocsSigns',
		Docs: {}
	};

	if(props.sendDeferral !== false && props.sendDeferral.length)
	{
		formData.event = 'saveDocsSigns';
		var deferralData = props.sendDeferral.split(' ');
		formData.sendDeferralDate = deferralData[0];
        formData.sendDeferralTime = deferralData[1];
	}

	CryptoPluginSignCount[intDocID] = {};
	CryptoPluginSignCount[intDocID]['max'] = props.certData.length;
	CryptoPluginSignCount[intDocID]['current'] = 0;
	CryptoPluginSignData[intDocID] = [];
	CryptoPluginCertData[intDocID] = [];

    var cert = (props.certData.length == 1) ? props.certData[0] : {certData: props.certData};
    var decline_comment = $('#decline_comment');
	var comment = (decline_comment.length > 0) ? decline_comment.val() : "";

	$.ajax({
		url: props.doctype,
		dataType: 'json',
		type: 'POST',
		data: $.extend({event: 'getXmlBodies', DocIDs: [intDocID], signByHash: signByHash, comment: comment, formData: props.formData}, cert),
		success: function (dataForSign) {
			$.ws.defaultAjaxSuccess(dataForSign);
			if (dataForSign == null || typeof dataForSign[0] == 'undefined' || (!dataForSign[0].varHash && !dataForSign[0].varXml)) {
                if (dataForSign == null || typeof dataForSign.messages == 'undefined' || dataForSign.messages == null)
                    $.ws.addErrorMessage('Ошибка формирования тела документа.');

				exTask.status.error(intDocID);
				$('#signButtons').show();
                $('#signStatus').hide();
				return;
			}

			formData.Docs[intDocID] = dataForSign[0];
			if (document.getElementById('intDocID'))
				formData.isRefresh = true; // чтобы работал редирект на форме одиночного подписания

			for (var i = 0; i < props.certData.length; i++) {
				signDataAndSend(dataForSign[0], formData, props.certData[i], props.doctype);
			}
		},
		error: function () {
			exTask.status.error(id);
            $('#signButtons').show();
            $('#signStatus').hide();
		}
	});
}