<?php

namespace App\Http\Controllers;
use App\Helpers\SignHelper;
use Illuminate\Http\Request;
use App\Sign;
use App\Doc;
use Auth;

class SignController extends Controller
{

    protected $filesTable, $docsTable, $docs;

    public function __construct()
    {
        $this->middleware('auth');
    }
    public function onSignVerify(Request $request)
    {
        //session_write_close();
        $result = SignHelper::verifyCertCrl($request->varCertBody);
        echo json_encode($result);
        exit();
    }

    /**
     * @param Sign $sign
     * @param Request $request
     */
    protected function onSign(Sign $sign, Request $request)
    {
        if (!empty($request->varDsign)) {
            $sign->varSignBody = $request->varDsign;
            $sign->save();
        }
        if ($sign->id) {
            $doc = Doc::find($request->intDocID);
            if (!is_object($doc) || empty($doc->sign_id) || !empty($doc->recipient_id)) {
                $doc = new Doc;
                $doc->file_id = $request->id;
                $doc->sender_id = Auth::id();
                $doc->varDocName = $request->varFileName;
                $doc->created_at = date('Y-m-d H:i:s', time());
                flash()->info('Документ создан и сохранен как черновик');
            } else {
                Sign::findOrFail($doc->sign_id)->delete();
                flash()->warning('Документ обновлен: Старая подпись удалена!');
                $doc->save();
            }
            $doc->sign_id = $sign->id;
            $doc->save();
            flash()->info('Документ подписан');
            echo json_encode(route('displaydoc',['file_id'=>$doc->file_id,'doc_id'=>$doc->id]));
            die;
        }
    }



}
