<?php

namespace App\Http\Controllers;

use App\File;
use App\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Doc;
use App\Sign;
use Auth;
use App\Http\Requests\SendDocRequest;
use App\Helpers\DocHelper;
use App\Helpers\SignHelper;

class DocController extends Controller
{

    protected $filesTable, $docsTable, $docs;
    public function __construct()
    {
        $this->filesTable = new File();
        $this->docsTable = new Doc();
        $this->middleware('auth');
        $this->middleware('roleadmin', ['only'=>'onsenddoc']);

    }

    /**
     * @param null $type
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index($type = null)
    {

        if (Auth::check())
        {
            $this->docs = ($type == 'draft')
                ? $this->docsTable->getDocsDraft(Auth::id())
                : $this->docsTable->getDocsData(Auth::id(), $type);
        }

        return view('home',['docs'=>$this->docs, $type=>true]);
    }
    public function displayDoc($file_id, $doc_id)
    {
        $doc = Doc::findOrFail($doc_id);
        if (!empty($doc->sign))
        {
            $this->sign_data = SignHelper::getDataVerifySign($doc->file->varFileBody, $doc->sign->toArray());
        }
        //dd($this->sign_data);
        return view('doc',['file_id'=>$file_id,
                'doc_id'=>$doc_id,
                'sign_data' => $this->sign_data]
        );
    }
   public function onSendDoc(SendDocRequest $request) {

        $data_insert = [];
        $sign_id = null;
        $docs = $request->all();
        $id = !empty($request->doc_id) ? $request->doc_id : $request->file_id;


        $recipient_ids = DocHelper::getContragentsIds($docs);

            $doc = Doc::find($id);
            if (is_object($doc) && empty($doc->recipient_id)) {
                $sign_id = $doc->sign_id;
                $created_at = $doc->created_at;
                $doc->delete();
            }
    foreach ($recipient_ids as $k=>$rec_id)
    {
        $data_row = [];
        $data_row['file_id'] = $request->file_id;
        $data_row['sender_id'] = Auth::id();
        $data_row['recipient_id'] = $rec_id->id;
        $data_row['varDocName'] = $this->filesTable->getDocById($docs['file_id'])['varFileName'];
        $data_row['created_at'] = isset($created_at) ? $created_at : Carbon::now();
        $data_row['updated_at'] = Carbon::now();
        $data_row['sign_id'] = $sign_id;
        $data_insert[] = $data_row;
    }

    if (!empty($data_insert)) {
        Doc::insert($data_insert);
    }
    else
    {
        flash()->error('ОШибка при отправке документа!');
    }
       flash()->info('Документы отправлены');
       return redirect('home/docs/outbox');
   }


    /**
     * @param Request $request
     */
    public function onGetAccess(Request $request)
    {
        if($request->ajax()) {
            $file_id = $request->all()['file_id'];
            $users_access_data = $this->docsTable->getUsersAccess($file_id);
            echo json_encode($users_access_data);
        }
    }

    /**
     * @param Request $request
     */
    public function onGetPdf(Request $request)
    {
            $file_id = $request->intFileID;
            $result = $this->filesTable->getDocById($file_id)->toArray();
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
