<?php

namespace App\Helpers;
//use File_ASN1;
class CryptoHelper
{

    /**
     * @param string $sign signature data
     * @param bool|false $base64 input data encoding type (binary or base64)
     * @return array signature properties
     *
     * ASN1 for CMS, RFC 5652 description:
     * http://www.in2eps.com/fo-cms/tk-fo-cms-asn1.html
     */
    public static function getDataFromSign($sign, $base64 = true) {
        $certDecoded = $certBody = $signingTime = null;

        $asn1 = new File_ASN1;
        if ($base64) $sign = base64_decode($sign);
        $decoded = $asn1->decodeBER($sign);
        $signer = [];

        $certificates = $decoded[0]['content'][1]['content'][0]['content'][3]['content'];
        $serialNumber = $decoded[0]['content'][1]['content'][0]['content'][4]['content'][0]['content'][1]['content'][1]['content'];

        foreach ($certificates as $certificate) {
            $certBody = substr($sign, $certificate['start'], $certificate['length']);
            $certBody = self::getPEMCertificate($certBody);
            $certDecoded = openssl_x509_parse($certBody, true);
            if (count($certificates) == 1 || $serialNumber == $certDecoded['serialNumber'])
                break;
        }
        $signedAttrs = $decoded[0]['content'][1]['content'][0]['content'][4]['content'][0]['content'][3]['content'];

        foreach ($signedAttrs as $Attribute) {
            $attrType = $Attribute['content'][0]['content']; // OBJECT IDENTIFIER

            if ($attrType == '1.2.840.113549.1.9.5')
                $signingTime = $Attribute['content'][1]['content'][0]['content'];
        }
        //dd($decoded);
        //$eContent = $decoded[0]['content'][1]['content'][0]['content'][2]['content'][1]['content'][0]['content'];

        $signer = array(
            'surname' => (!empty($certDecoded['subject']['surName'])) ?
                $certDecoded['subject']['surName'] : $certDecoded['subject']['SN'],
            'givenName' => (!empty($certDecoded['subject']['givenName'])) ?
                $certDecoded['subject']['givenName'] : $certDecoded['subject']['GN'],
            'organizationName' => $certDecoded['subject']['O'],
            'title' => $certDecoded['subject']['title'],
            'localityCountry' => $certDecoded['subject']['C'],
            'localityName' => $certDecoded['subject']['L'],
            'localityRegion' => $certDecoded['subject']['ST'],
            'streetAddress' => $certDecoded['subject']['street'],
            'dateForm' => date('Y-m-d h:i:s', $certDecoded['validFrom_time_t']),
            'dateTo' => date('Y-m-d h:i:s', $certDecoded['validTo_time_t']),
            'uc' => $certDecoded['issuer']['O'],
            'serial' => (new Math_BigInteger($certDecoded['serialNumber']))->toHex(),
            //'data' => $eContent,
            'signDate' => date('Y-m-d h:i:s', $signingTime),
            'certBody' => $certBody
        );
        $signer['name'] = explode(' ', $signer['givenName'])[0];
        $signer['patronymic'] = explode(' ', $signer['givenName'])[1];
        return $signer;
    }

    /**
     * @param $data string certificate DER encoded
     * @return string certificate PEM encoded
     */
    public static function getPEMCertificate($data) {
        return
            '-----BEGIN CERTIFICATE-----'."\n".
            chunk_split(base64_encode($data),64,"\n").
            '-----END CERTIFICATE-----'."\n";
    }

}