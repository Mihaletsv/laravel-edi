var CryptoProAsync = (function() {
	var publicAPI = {};

	publicAPI.VerifyPlugin = function() {
		var pluginInfo = {};
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		var verify_chrome = new XMLHttpRequest();
		var chrome_url = 'chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/nmcades_plugin_api.js';
		verify_chrome.onreadystatechange = function() {
			if (verify_chrome.readyState === 4) {
				if (verify_chrome.status === 200) { // Chrome CADES extension available, try to load NMAPI plugin
					cadesplugin.load_chrome_extension(function(){ // Async plugin load to make sure that js file is available
						cadesplugin.async_spawn(function *() { // Generator function
							try {
								var pluginObject = yield cpcsp_chrome_nmcades.CreatePluginObject();
								cadesplugin.set(pluginObject);
								cadesplugin.type = 'NMAPI';
								var oAbout = yield cadesplugin.CreateObjectAsync("CAdESCOM.About");
								var pluginVer = yield oAbout.PluginVersion;
								pluginInfo.pluginVersion = (yield pluginVer.MajorVersion) + "." + (yield pluginVer.MinorVersion) + "." + (yield pluginVer.BuildVersion);
								var cspVer = yield oAbout.CSPVersion("", 75);
								pluginInfo.cspVersion = (yield cspVer.MajorVersion) + "." + (yield cspVer.MinorVersion) + "." + (yield cspVer.BuildVersion);
								pluginInfo.isLoaded = true;
								pluginInfo.pluginType = cadesplugin.type;
								success(pluginInfo);
							}
							catch (ex) {
								pluginInfo.isLoaded = false;
								pluginInfo.error = cadesplugin.GetErrorMessage(ex);
								success(pluginInfo);
							}
						});
					});
				}
				else { // Chrome CADES extension is not available
					pluginInfo.isLoaded = false;
					pluginInfo.error = 'CryptoPro Extension for CAdES Browser Plug-in is not available';
					success(pluginInfo);
				}
			}
		};
		verify_chrome.open('HEAD', chrome_url);
		verify_chrome.send();

		return result;
	};

	publicAPI.GetCertList = function() {
		var CAPICOM_ENCODE_BASE64 = 0;

		var certList = [];
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		cadesplugin.async_spawn(function *() { //cadesplugin.async_spawn
			var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.store");
			if (!oStore) {
				certList.error = "CAPICOM store failed";
				success(certList);
				return;
			}

			try {
				yield oStore.Open();
			} catch (ex) {
				certList.error = "Ошибка при открытии хранилища: " + cadesplugin.GetErrorMessage(ex);
				success(certList);
				return;
			}

			var certCnt;
			try {
				certs = yield oStore.Certificates;
				certCnt = yield certs.Count;
			} catch (ex) {
				certList.error = "Ошибка при открытии контейнера: " + cadesplugin.GetErrorMessage(ex);
				success(certList);
				return;
			}

			for (var i = 1; i <= certCnt; i++) {
				var cert;
				try {
					cert = yield certs.Item(i);
				} catch (ex) {
					certList.error = "Ошибка при перечислении сертификатов: " + cadesplugin.GetErrorMessage(ex);
					success(certList);
					return;
				}
				var dateObj = new Date();
				try {
					var SubjectName = yield cert.SubjectName;
					var ValidFromDate = yield cert.ValidFromDate;
					var ValidToDate = yield cert.ValidToDate;
					var HasPrivateKey = yield cert.HasPrivateKey();
					var Thumbprint = yield cert.Thumbprint;
					var IssuerName = yield cert.IssuerName;
					var Validator = yield cert.IsValid();
					var SerialNumber = yield cert.SerialNumber;
					var CertBody = yield cert.Export(CAPICOM_ENCODE_BASE64);
					var SubjectUnstructuredName = cadesplugin.extract(SubjectName,'OID.1.2.840.113549.1.9.2=');
					//var IsValid = yield Validator.Result;
					//if (IsValid === 1) IsValid = true; else IsValid = false;
					var IsValid = null;
					var certListLength = certList.push({ // Заполняем массив
						cname: cadesplugin.extract(SubjectName,'CN='),
						fname: cadesplugin.extract(SubjectName,'G='),
						sname: cadesplugin.extract(SubjectName,'SN='),
						entity: cadesplugin.extract(SubjectName,'O='),
						country: cadesplugin.extract(SubjectName,'C='),
						region: cadesplugin.extract(SubjectName,'S='),
						city: cadesplugin.extract(SubjectName,'L='),
						street: cadesplugin.extract(SubjectName,'STREET='),
						position: cadesplugin.extract(SubjectName,'T='),
						ogrn: 	cadesplugin.extract(SubjectName,'OGRN=') +
								cadesplugin.extract(SubjectName,'ОГРН=') +
								cadesplugin.extract(SubjectName,'1.2.643.100.1=') +
								cadesplugin.extract(SubjectName,'OID.1.2.643.100.1='),
						ogrnip: cadesplugin.extract(SubjectName,'OGRNIP=') +
								cadesplugin.extract(SubjectName,'ОГРНИП=') +
								cadesplugin.extract(SubjectName,'1.2.643.100.5=') +
								cadesplugin.extract(SubjectName,'OID.1.2.643.100.5='),
                        snils: 	cadesplugin.extract(SubjectName,'SNILS=') +
								cadesplugin.extract(SubjectName,'СНИЛС=') +
								cadesplugin.extract(SubjectName,'1.2.643.100.3=') +
								cadesplugin.extract(SubjectName,'OID.1.2.643.100.3='),
						inn: 	cadesplugin.extract(SubjectName,'INN=') +
								cadesplugin.extract(SubjectName,'ИНН=') +
                        		cadesplugin.extract(SubjectName,'ИНН организации=') +
								cadesplugin.extract(SubjectName,'1.2.643.3.131.1.1=') +
								cadesplugin.extract(SubjectName,'OID.1.2.643.3.131.1.1='),
						email: cadesplugin.extract(SubjectName,'E='),
						dateFrom: ValidFromDate,
						dateTo: ValidToDate,
						all: SubjectName,
						hasPrivate: HasPrivateKey,
						thumb: Thumbprint,
						serial: SerialNumber,
						valid: IsValid,
						body: CertBody,
						issuer: {
							cname: cadesplugin.extract(IssuerName,'CN='),
							entity: cadesplugin.extract(IssuerName,'O='),
							region: cadesplugin.extract(IssuerName,'S='),
							inn: 	cadesplugin.extract(IssuerName,'INN=') +
									cadesplugin.extract(IssuerName,'ИНН=') +
									cadesplugin.extract(IssuerName,'1.2.643.3.131.1.1=') +
									cadesplugin.extract(IssuerName,'OID.1.2.643.3.131.1.1='),
							ogrn: 	cadesplugin.extract(IssuerName,'OGRN=') +
									cadesplugin.extract(IssuerName,'ОГРН=') +
									cadesplugin.extract(IssuerName,'1.2.643.100.1=') +
									cadesplugin.extract(IssuerName,'OID.1.2.643.100.1='),
							city: cadesplugin.extract(IssuerName,'L='),
							street: cadesplugin.extract(IssuerName,'STREET='),
							email: cadesplugin.extract(IssuerName,'E='),
							all: IssuerName
						}
					});

					var certListKey = certListLength - 1;
					if (!certList[certListKey].ogrn)
                        certList[certListKey].ogrn = cadesplugin.extract(SubjectUnstructuredName,'OGRN=', true);
                    if (!certList[certListKey].ogrnip)
                        certList[certListKey].ogrnip = cadesplugin.extract(SubjectUnstructuredName,'OGRNIP=', true);
                    if (!certList[certListKey].snils)
                        certList[certListKey].snils = cadesplugin.extract(SubjectUnstructuredName,'SNILS=', true);
                    if (!certList[certListKey].inn)
                        certList[certListKey].inn = cadesplugin.extract(SubjectUnstructuredName,'INN=', true);

				} catch (ex) {
					certList.push({
						error: "Ошибка при получении свойств сертификата: " + cadesplugin.GetErrorMessage(ex)
					});
				}
			}
			yield oStore.Close();
			success(certList);
		});
		return result;
	};

	publicAPI.GetDataHash = function(data) {
		var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;
		var CADESCOM_BASE64_TO_BINARY = 1;

		var hash = {};
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		cadesplugin.async_spawn(function*() { //cadesplugin.async_spawn
			try {
				var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
				yield oHashedData.propset_Algorithm(CADESCOM_HASH_ALGORITHM_CP_GOST_3411);
				yield oHashedData.propset_DataEncoding(CADESCOM_BASE64_TO_BINARY);
				yield oHashedData.Hash(data);
				hash = yield oHashedData.Value;
				success(hash);
			}
			catch (ex) {
				hash.error = cadesplugin.GetErrorMessage(ex);
				success(hash);
			}
		});
		return result;
	};

	publicAPI.SignCades = function(certThumbprint, dataToSign, isDetached, signType, isHash) {
		var signTypes = {
			'CADES_BES' 		  : 0x01,
			'CADES_T' 			  : 0x05,
			'CADES_X_LONG_TYPE_1' : 0x5d
		};
		var CADES_SIGN_TYPE = (signType)? signTypes[signType] : signTypes.CADES_BES;
		var CAPICOM_CERTIFICATE_INCLUDE_CHAIN_EXCEPT_ROOT = 0;
		var CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN = 1;
		var CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY = 2;
		var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
		var CADESCOM_BASE64_TO_BINARY = 1;
		var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;
		if (!isDetached && isDetached !== false) isDetached = true; // Detached signature by default

		var signature = {};
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		cadesplugin.async_spawn(function*() { //cadesplugin.async_spawn
			try {
				var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.store");
				yield oStore.Open();
				var all_certs = yield oStore.Certificates;
				var oCerts = yield all_certs.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certThumbprint);

				if (oCerts.Count === 0) {
					signature.error = "Certificate not found";
					success(signature);
					return;
				}
				var certificate = yield oCerts.Item(1);
				var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
				var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
				yield oSigner.propset_Certificate(certificate);
				yield oSigner.propset_TSAAddress("http://tax4.tensor.ru/tsp/tsp.srf");
				yield oSigner.propset_Options(CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY);

				if (isHash) {
					var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
					yield oHashedData.propset_Algorithm(CADESCOM_HASH_ALGORITHM_CP_GOST_3411);
					yield oHashedData.SetHashValue(dataToSign);
					signature = yield oSignedData.SignHash(oHashedData, oSigner, CADES_SIGN_TYPE);
				} else {
					yield oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
					yield oSignedData.propset_Content(dataToSign);
					signature = yield oSignedData.SignCades(oSigner, CADES_SIGN_TYPE, isDetached);
				}

				success(signature);
			}
			catch (ex) {
				signature.error = cadesplugin.GetErrorMessage(ex);
				success(signature);
			}
		});
		return result;
	};

    publicAPI.SignRaw = function(certThumbprint, hashToSign) {
        var CADESCOM_BASE64_TO_BINARY = 1;
        var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;
        var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;

        var signature = {};
        var success;
        var error;

        var result = new Promise(function(resolve, reject){
            success = resolve;
            error = reject;
        });

        cadesplugin.async_spawn(function*() { //cadesplugin.async_spawn
            try {
                var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.store");
                yield oStore.Open();
                var all_certs = yield oStore.Certificates;
                var oCerts = yield all_certs.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certThumbprint);

                if (oCerts.Count === 0) {
                    signature.error = "Certificate not found";
                    success(signature);
                    return;
                }

                var certificate = yield oCerts.Item(1);
                var rawSignature = yield cadesplugin.CreateObjectAsync("CAdESCOM.RawSignature");

                var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
                yield oHashedData.propset_Algorithm(CADESCOM_HASH_ALGORITHM_CP_GOST_3411);
                yield oHashedData.SetHashValue(hashToSign);
                signature = yield rawSignature.SignHash(oHashedData, certificate);

                success(signature);
            }
            catch (ex) {
                signature.error = cadesplugin.GetErrorMessage(ex);
                success(signature);
            }
        });
        return result;
    };

    publicAPI.VerifySignCades = function(signatureBody, dataToVerify, isDetached, isHash) {
		var CADESCOM_CADES_BES = 1;
		var CADESCOM_BASE64_TO_BINARY = 1;
        var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;

        if (!isDetached && isDetached !== false) isDetached = true; // Detached signature by default

		var verify = {};
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		cadesplugin.async_spawn(function *() { //cadesplugin.async_spawn
			try {
                var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

                if (isHash) {
                    var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
                    yield oHashedData.propset_Algorithm(CADESCOM_HASH_ALGORITHM_CP_GOST_3411);
                    yield oHashedData.SetHashValue(dataToVerify);
                    yield oSignedData.VerifyHash(oHashedData, signatureBody, CADESCOM_CADES_BES);
                    verify = true;
                } else {
                    yield oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
                    yield oSignedData.propset_Content(dataToVerify);
                    yield oSignedData.VerifyCades(signatureBody, CADESCOM_CADES_BES, isDetached);
                    verify = true;
                }

				success(verify);
			}
			catch (ex) {
				verify.error = "Failed to verify signature. Error: " + cadesplugin.GetErrorMessage(ex);
				success(verify);
			}
		});
		return result;
	};

	publicAPI.EncryptGOST = function(dataToCrypt, certThumbprint) {
		var CADESCOM_BASE64_TO_BINARY = 0x01;
		var CADESCOM_STRING_TO_UCS2LE = 0x00;
		var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;

		var encryptedData = {};
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		cadesplugin.async_spawn(function *() { //cadesplugin.async_spawn
			try {
				var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.store");
				yield oStore.Open();
				var all_certs = yield oStore.Certificates;
				var oCerts = yield all_certs.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certThumbprint);

				if (oCerts.Count === 0) {
					encryptedData.error = "Certificate not found";
					success(encryptedData);
					return;
				}
				var certificate = yield oCerts.Item(1);

				var oEnvelop = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPEnvelopedData");
				yield oEnvelop.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
				yield oEnvelop.propset_Content(dataToCrypt);
				var recipients = yield oEnvelop.Recipients;
				yield recipients.Clear();
				yield recipients.Add(certificate);

				encryptedData.base64 = yield oEnvelop.Encrypt();
				encryptedData.ber = cadesplugin.Base64ToBer(encryptedData.base64);
				success(encryptedData);
			}
			catch (ex) {
				encryptedData.error = "Failed to crypt data. Error: " + cadesplugin.GetErrorMessage(ex);
				success(encryptedData);
			}
		});
		return result;
	};

	publicAPI.DecryptGOST = function(encryptedData) {
		var CADESCOM_BASE64_TO_BINARY = 0x01;
		var CADESCOM_STRING_TO_UCS2LE = 0x00;

		var decryptedData = {};
		var success;
		var error;

		var result = new Promise(function(resolve, reject){
			success = resolve;
			error = reject;
		});

		if (!cadesplugin.Base64isValid(encryptedData)) { // Данные на вход дожны поступить в Base64 виде.
			encryptedData = cadesplugin.BerToBase64(encryptedData);
		}

		cadesplugin.async_spawn(function *() { //cadesplugin.async_spawn
			try {
				var oEnvelop = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPEnvelopedData");
				yield oEnvelop.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
				yield oEnvelop.Decrypt(encryptedData);
				decryptedData = yield oEnvelop.Content;
				success(decryptedData);
			}
			catch (ex) {
				decryptedData.error = "Failed to decrypt message. Error: " + cadesplugin.GetErrorMessage(ex);
				success(decryptedData);
			}
		});
		return result;
	};

	return publicAPI;
})();