/** \autor ������ �.�.
 * $ws.core.ready.addCallback(function(){ 
 * 	CryptoInit(myCryptoAppletLoaded);
 * 	});
 * });
 */
var cryptoinitfunctions = [];
var cryptoinitstarted = false;
var cryptoinitended = false;

function CryptoInit(initfunc){
	//������� ������ ������������.
	if(cryptoinitstarted){
		if(cryptoinitended)
			initfunc();
		return ;			
	}

	loadApplet();
	cryptoinitstarted = true;
	setTimeout( TestCryptoApplet, 500 );
}


function CryptoALoaded(){
	cryptoinitended = true;
}

// �������� �������� �������
function TestCryptoApplet(){ 
	if($.browser.msie){
		//console.log('rhapplet:',document.rhApplet);
		for( var i = 0; i< document.applets.length; ++i){
			//console.log('index:', i, '  applets[i]:', document.applets[i]);
			//console.log('name:', document.applets[i].name);
			if( document.applets[i].isActive() && document.applets[i].name=='cryptoApplet'){
				CryptoALoaded();
				return ;
			}
		}
		setTimeout(TestCryptoApplet, 500);
	}else{
		//console.log('rhapplet:',document.rhApplet);
		if(document.cryptoApplet!=undefined &&  document.cryptoApplet!=null)
			if( !document.cryptoApplet.isActive ){
				setTimeout(TestCryptoApplet, 500);		
			}else{
				CryptoALoaded();
			}
		else{
			setTimeout(TestCryptoApplet, 500);		
		}
	}
}

// ������� �������� �������
function loadApplet(){
	//$("body").append($('<div id="debug"></div>'));
	if( $('#cryptoApplet').length!=0 )
		return ;
	var applet ;
	var str = '';
	var baseUrl = document.location.origin;

	if($.browser.msie){
		// msie
		str = '<object ' +
		'id="cryptoApplet" ' +
		'name="cryptoApplet" ' +
		'codetype="application/java" ' +
		//'codebase="http://java.sun.com/update/1.6.0/jinstall-6u27-windows-i586.cab#Version=1,6,0,27" ' +
		'classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" ' +
		'width="0" height="0" > ' +
		'<param name="code" value="ru.tensor.SbisCryptoApplet.SBISCRYPTO"/> ' +
		'<param name="archive" value="https://edi.su/classes/SbisCryptoApplet.jar"/> ' +
		'<param name="outsource_code" value="true"/> ' +
		'<param name="java_arguments" value="-Xms64m -Xmx128m"> ' +
		'<param name="zipDomain" value="https://' + window.location.host + '"/> ' +
		'</object>';
	}else{
		str = '<embed type="application/x-java-applet" '+
		'id="cryptoApplet" '+
		'NAME="cryptoApplet" '+
		'width="0" height="0" '+
		'archive="https://edi.su/classes/SbisCryptoApplet.jar" '+
		'outsource_code="true" ' +
		'code="ru.tensor.SbisCryptoApplet.SBISCRYPTO" '+
		'java_arguments="-Xms64m -Xmx128m" /> ';

	};
	$("html").append(str);
}

// ������� �������� �������
function unloadApplet(){
	$('#cryptoApplet').empty().remove();
};