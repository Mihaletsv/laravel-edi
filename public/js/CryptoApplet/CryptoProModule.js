var CryptoProModule = (function() {
	var publicAPI = {};

	function isChromiumBased() {
		return (navigator.userAgent.match(/chrome/i) ||
		navigator.userAgent.match(/opera/i));
	}

	function ObjCreator(name) {
		switch (navigator.appName) {
			case 'Microsoft Internet Explorer':
				return new ActiveXObject(name);
			default:
				var userAgent = navigator.userAgent;
				if (userAgent.match(/Trident\/./i)) { // IE10, 11
					return new ActiveXObject(name);
				}
				if (userAgent.match(/ipod/i) || userAgent.match(/ipad/i) || userAgent.match(/iphone/i)) {
					return call_ru_cryptopro_npcades_10_native_bridge("CreateObject", [name]);
				}
				var cadesobject = document.getElementById('cadesplugin_object');
				return cadesobject.CreateObject(name);
		}
	}

	function GetCertificate(certThumbprint) {
		try {
			var oStore = ObjCreator("CAPICOM.store");
			oStore.Open();
		} catch (ex) {
			throw 'Failed to create CAPICOM.store: ' + ex.number;
		}

		var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
		var oCerts = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certThumbprint);

		if (oCerts.Count === 0) {
			throw "Certificate not found";
		}
		var oCert = oCerts.Item(1);
		return oCert;
	}

	publicAPI.VerifyPlugin = function() {

		if (isChromiumBased()) {
			return CryptoProAsync.VerifyPlugin();
		}
		else { // Chrome CADES extension is not available, try to load NPAPI plugin
			var pluginInfo = {};
			var result = {};
			cadesplugin.load_npapi_plugin();
			cadesplugin.type = 'NPAPI';
			try {
				var oAbout = ObjCreator("CAdESCOM.About");
				pluginInfo.isLoaded = true;
				pluginInfo.pluginVersion = oAbout.PluginVersion;
				pluginInfo.pluginVersion = oAbout.Version;
				var ver = oAbout.CSPVersion("", 75);
				pluginInfo.cspVersion = ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
				pluginInfo.pluginType = cadesplugin.type;
			} catch (ex) {
				pluginInfo.isLoaded = false;
				pluginInfo.error = cadesplugin.GetErrorMessage(ex);
			}
			result.then = function(callback) {
				callback(pluginInfo);
			};
			return result;
		}
	};

	publicAPI.GetCertList = function() {

		if (cadesplugin.type == 'NMAPI') { // Async NMAPI calls are separated to provide IE support
			return CryptoProAsync.GetCertList();
		}
		else { // Conventional synchronous calls for NPAPI plugin
			var CAPICOM_ENCODE_BASE64 = 0;

			var certList = [];
			var result = {};
			var oStore = ObjCreator("CAPICOM.store");

			if (!oStore) {
				certList.error = "CAPICOM store failed";
			}
			try {
				oStore.Open();
			} catch (ex) {
				certList.error = "Ошибка при открытии хранилища: " + cadesplugin.GetErrorMessage(ex);
			}

			var certCnt;
			try {
				certCnt = oStore.Certificates.Count;
			} catch (ex) {
				certList.error = "Ошибка при открытии контейнера: " + cadesplugin.GetErrorMessage(ex);
			}

			for (var i = 1; i <= certCnt; i++) {
				var cert;
				try {
					cert = oStore.Certificates.Item(i);
				} catch (ex) {
					certList.error = "Ошибка при перечислении сертификатов: " + cadesplugin.GetErrorMessage(ex);
				}
				var dateObj = new Date();
				try {
					var IsValid = null;
					var SubjectName = cert.SubjectName;
					var IssuerName = cert.IssuerName;
					//if (cert.IsValid().Result === 1 || cert.IsValid().Result === true) IsValid = true; else IsValid = false;
                    var SubjectUnstructuredName = cadesplugin.extract(SubjectName,'OID.1.2.840.113549.1.9.2=');
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
						dateFrom: (typeof(cert.ValidFromDate) == 'object')? cert.ValidFromDate.toISOString() : new Date(cert.ValidFromDate).toISOString(),
						dateTo: (typeof(cert.ValidToDate) == 'object')? cert.ValidToDate.toISOString() : new Date(cert.ValidToDate).toISOString(),
						all: SubjectName,
						hasPrivate: cert.HasPrivateKey(),
						thumb: cert.Thumbprint.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase(),
						serial: cert.SerialNumber,
						valid: IsValid,
						body: cert.Export(CAPICOM_ENCODE_BASE64),
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
			oStore.Close();
			result.then = function(callback) {
				callback(certList);
			};
			return result;
		}
	};

	publicAPI.GetDataHash = function(data) {

		if (cadesplugin.type == 'NMAPI') { // Async NMAPI calls are separated to provide IE support
			return CryptoProAsync.GetDataHash(data);
		}
		else { // Conventional synchronous calls for NPAPI plugin
			var hash = {};
			var result = {};
			var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;
			var CADESCOM_BASE64_TO_BINARY = 1;

			try {
				var oHashedData = ObjCreator("CAdESCOM.HashedData");
				oHashedData.Algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
				oHashedData.DataEncoding = CADESCOM_BASE64_TO_BINARY;
				oHashedData.Hash(data);
				hash = oHashedData.Value;
			} catch (ex) {
				hash.error = "Failed to create hash. Error: " + cadesplugin.GetErrorMessage(ex);
			}

			result.then = function(callback) {
				callback(hash);
			};
			return result;
		}
	};

	publicAPI.SignCades = function(certThumbprint, dataToSign, isDetached, signType, isHash) {

		if (cadesplugin.type == 'NMAPI') { // Async NMAPI calls are separated to provide IE support
			return CryptoProAsync.SignCades(certThumbprint, dataToSign, isDetached, signType, isHash);
		}
		else { // Conventional synchronous calls for NPAPI plugin
			var signature = {};
			var result = {};

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
			if (!isDetached && isDetached !== false) isDetached = true;	// Detached signature by default

			try {
				var certObject = GetCertificate(certThumbprint);
				var oSigner = ObjCreator("CAdESCOM.CPSigner");
				oSigner.Certificate = certObject;
				oSigner.TSAAddress = "http://tax4.tensor.ru/tsp/tsp.srf";
				oSigner.Options = CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY;
				var oSignedData = ObjCreator("CAdESCOM.CadesSignedData");

				if (isHash) {
					var oHashedData = ObjCreator("CAdESCOM.HashedData");
					oHashedData.Algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
					oHashedData.SetHashValue(dataToSign);
					signature = oSignedData.SignHash(oHashedData, oSigner, CADES_SIGN_TYPE);
				} else {
					oSignedData.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
					oSignedData.Content = dataToSign;
					signature = oSignedData.SignCades(oSigner, CADES_SIGN_TYPE, isDetached);
				}
			} catch (ex) {
				signature.error = "Failed to create signature. Error: " + cadesplugin.GetErrorMessage(ex);
			}

			result.then = function(callback) {
				callback(signature);
			};
			return result;
		}
	};

    publicAPI.SignRaw = function(certThumbprint, hashToSign) {

        if (cadesplugin.type == 'NMAPI') { // Async NMAPI calls are separated to provide IE support
            return CryptoProAsync.SignRaw(certThumbprint, hashToSign);
        }
        else { // Conventional synchronous calls for NPAPI plugin
            var signature = {};
            var result = {};

            var CADESCOM_BASE64_TO_BINARY = 1;
            var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;

            try {
                var certObject = GetCertificate(certThumbprint);
                var rawSignature = ObjCreator("CAdESCOM.RawSignature");

                var oHashedData = ObjCreator("CAdESCOM.HashedData");
                oHashedData.Algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
                oHashedData.SetHashValue(hashToSign);

                signature = rawSignature.SignHash(oHashedData, certObject);

            } catch (ex) {
                signature.error = "Failed to create signature. Error: " + cadesplugin.GetErrorMessage(ex);
            }

            result.then = function(callback) {
                callback(signature);
            };
            return result;
        }
    };

	publicAPI.VerifySignCades = function(signatureBody, dataToVerify, isDetached, isHash) {

		if (cadesplugin.type == 'NMAPI') { // Async NMAPI calls are separated to provide IE support
			return CryptoProAsync.VerifySignCades(signatureBody, dataToVerify, isDetached, isHash);
		}
		else { // NPAPI plugin, conventional synchronous calls
			var verify = {};
			var result = {};

			var CADESCOM_CADES_BES = 1;
			var CADESCOM_BASE64_TO_BINARY = 1;
            var CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;

            if (!isDetached && isDetached !== false) isDetached = true; // Detached signature by default

			try {
                var oSignedData = ObjCreator("CAdESCOM.CadesSignedData");

                if (isHash) {
                    var oHashedData = ObjCreator("CAdESCOM.HashedData");
                    oHashedData.Algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
                    oHashedData.SetHashValue(dataToVerify);
                    oSignedData.VerifyHash(oHashedData, signatureBody, CADESCOM_CADES_BES);
                    verify = true;
                } else {
                    oSignedData.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
                    oSignedData.Content = dataToVerify;
                    oSignedData.VerifyCades(signatureBody, CADESCOM_CADES_BES, isDetached);
                    verify = true;
                }
			} catch (ex) {
				verify.error = "Failed to verify signature. Error: " + cadesplugin.GetErrorMessage(ex);
			}
			result.then = function(callback) {
				callback(verify);
			};
			return result;
		}
	};

	publicAPI.EncryptGOST = function(dataToCrypt, certThumbprint) {

		if (cadesplugin.type == 'NMAPI') { // Creating Promise only for NMAPI browsers (to provide IE & older stuff support)
			return CryptoProAsync.EncryptGOST(dataToCrypt, certThumbprint);
		}
		else {
			var encryptedData = {};
			var result = {};

			var CADESCOM_BASE64_TO_BINARY = 0x01;
			var CADESCOM_STRING_TO_UCS2LE = 0x00;
			var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;

			try {
				var oEnvelop = ObjCreator("CAdESCOM.CPEnvelopedData");
			} catch (ex) {
				encryptedData.error = "Failed to create CAdESCOM.CPEnvelopedData: " + cadesplugin.GetErrorMessage(ex);
				result.then = function(callback) {
					callback(encryptedData);
				};
			}
			try {
				certificate = GetCertificate(certThumbprint);
				oEnvelop.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
				oEnvelop.Content = dataToCrypt;
				oEnvelop.Recipients.Clear();
				oEnvelop.Recipients.Add(certificate);
				encryptedData.base64 = oEnvelop.Encrypt();
				encryptedData.ber = cadesplugin.Base64ToBer(encryptedData.base64);
			} catch(ex) {
				encryptedData.error = "Failed to crypt data. Error: " + cadesplugin.GetErrorMessage(ex);
			}
			result.then = function(callback) {
				callback(encryptedData);
			};
			return result;
		}
	};

	publicAPI.DecryptGOST = function(encryptedData) {

		if (cadesplugin.type == 'NMAPI') { // Creating Promise only for NMAPI browsers (to provide IE & older stuff support)
			return CryptoProAsync.DecryptGOST(encryptedData);
		}
		else { // NPAPI plugin, conventional synchronous calls
			var decryptedData = {};
			var result = {};

			var CADESCOM_BASE64_TO_BINARY = 0x01;
			var CADESCOM_STRING_TO_UCS2LE = 0x00;

			if (!cadesplugin.Base64isValid(encryptedData)) { // Данные на вход дожны поступить в Base64 виде.
				encryptedData = cadesplugin.BerToBase64(encryptedData);
			}
			try {
				var oEnvelop = ObjCreator("CAdESCOM.CPEnvelopedData");
			} catch (ex) {
				decryptedData.error = "Failed to create CAdESCOM.CPEnvelopedData: " + cadesplugin.GetErrorMessage(ex);
				result.then = function(callback) {
					callback(decryptedData);
				};
			}
			try {
				oEnvelop.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
				oEnvelop.Decrypt(encryptedData);
				decryptedData = oEnvelop.Content;
			} catch(ex) {
				decryptedData.error = "Failed to decrypt message. Error: " + cadesplugin.GetErrorMessage(ex);
			}
			result.then = function(callback) {
				callback(decryptedData);
			};
			return result;
		}
	};

	return publicAPI;
})();