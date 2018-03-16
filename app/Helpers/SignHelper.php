<?php
namespace App\Helpers;



class SignHelper {

    /**
     * @param $varBody
     * @param $varSigns
     * @return array
     */
    public static function getDataVerifySign($varBody,$varSign)
    {
        $signData = [];
        //dd($varSigns);
            $signData['cert_data'] = CryptoHelper::getDataFromSign($varSign['varSignBody']);
            $signData['isValid'] = self::verifySign($varSign['varSignBody'], $varBody);
        return $signData;
    }

    public static function verifySign($sign, $data) {
        $reqBody = array();
        $reqBody['xml'] = base64_encode($data);
        $reqBody['sign'] = base64_encode($sign);
        $reqBody['subserviceid'] = 2;
        $reqBody['method'] = 'verify';
        $reqBody['login'] = 'test';
        $reqBody['pass'] = 'test';
        $reqBody = json_encode($reqBody);

        $PORT = 1488;
        $HOST = 'ru-cryptex.ru.int';

        $socket = socket_create(AF_INET, SOCK_STREAM, 0); //Creating a TCP socket
        socket_connect($socket, $HOST, $PORT); //Connecting to to server using that socket
        socket_write($socket, $reqBody . "\n", strlen($reqBody) + 1); //Writing the text to the socket
        $reply = socket_read($socket, 100000, PHP_NORMAL_READ);
        $answer = json_decode($reply, true);
//dd($answer);
        $result = isset($answer['res'])?$answer['res']:false;
/*        if (empty($answer))
            throw new AbstractConnectionException('Sing verification error, possibly ru-cryptex.ru.int is stopped', 202);*/

        return ($result === 'true');
    }


    /**
     * @param array $crl_list
     * @return null|string
     */
    private static function getCrlBodySerials($crl_list)
    {
        $serials_list = null;

        foreach ($crl_list as $crl_url) {
            if (empty($crl_url)) continue;

            // nalogtelecom.ru недоступен из Украины (блокировка с их стороны), забираем файл через прокси
            $crl_body = file_get_contents(str_replace('www.nalogtelecom.ru', '172.16.162.42:88', $crl_url));
            if (empty($crl_body)) continue;

            if (preg_match('/^[a-zA-Z0-9\/\r\n+]*={0,2}$/', preg_replace('/\s+/', '', $crl_body)))
                $crl_body = base64_decode(preg_replace('/\s+/', '', $crl_body));
            $crl_file = tempnam(sys_get_temp_dir(), 'crl_');
            file_put_contents($crl_file, $crl_body);

            $serials_list = shell_exec('openssl crl -in '.$crl_file.' -inform der -text -noout 2>/dev/null | egrep "Certificate Revocation List|Serial Number" -A 1');
            unlink($crl_file);

            if (!empty($serials_list)) break;
        }

        return $serials_list;
    }

    public static function verifyCertCrl($cert_body)
    {
        $cert_body = preg_replace('/\s+/', '',$cert_body);
        $cert_body = '-----BEGIN CERTIFICATE-----'."\n".chunk_split($cert_body,64,"\n").'-----END CERTIFICATE-----'."\n";
        $cert_decoded = openssl_x509_parse($cert_body, true);

        $crl_list = $cert_decoded['extensions']['crlDistributionPoints'];
        $crl_list = preg_replace('/\s+/', '',str_replace('Full Name:','',$crl_list));
        $crl_list = explode('URI:', $crl_list);

        $serials_list = self::getCrlBodySerials($crl_list);

        if (empty($serials_list)) {
            echo json_encode(['revoked' => 'error']);
            exit();
        }

        $cert_serial = new Math_BigInteger($cert_decoded['serialNumber']);
        $cert_serial = strtoupper($cert_serial->toHex());

        $serials_list = explode('Serial Number:', $serials_list);
        $result = array();
        foreach ($serials_list as $key => $data) {
            if ($key == 0) continue;
            $data = explode('Revocation Date:', $data);
            $revoked_serial = preg_replace('/\s+/', '', $data[0]);
            if ($revoked_serial == $cert_serial) {
                $result['revoked'] = true;
                $result['revokedDate'] = trim(str_replace('--', '', $data[1]));
            }
        }

        if (empty($result)) $result['revoked'] = false;
        return $result;
    }

    public static function sha1_thumbprint($file) {
        $result = array();
        $file = preg_replace('/\-+BEGIN CERTIFICATE\-+/', '', $file);
        $file = preg_replace('/\-+END CERTIFICATE\-+/', '', $file);
        $file = trim($file);
        $result['certificate_body'] = $file;
        $file = str_replace(array("\n\r", "\n", "\r"), '', $file);
        $bin = base64_decode($file);
        $result['certificate_hash'] = sha1($bin);
        return $result;
    }
}