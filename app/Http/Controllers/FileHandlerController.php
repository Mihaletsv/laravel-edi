<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Auth;

class FileHandlerController extends HomeController
{
    public function onUploadFile(Request $request)  {
        $this->validate($request, [
            'file_upload' => 'mimes:pdf|between:0,10000'
        ]);
        $file = $request->file('file_upload');
        $fileName = $file->getClientOriginalName();
        $fileBody = file_get_contents($file->getRealPath());
        $this->filesTable->user_id = Auth::id();
        $this->filesTable->varFileName = $fileName;
        $this->filesTable->varFileBody = base64_encode($fileBody);
        $this->filesTable->save();
        flash()->info('Файл добавлен');
        return redirect('home');
    }


    public function onBrowseFile($file_id)  {
        $file_data = $this->filesTable->getDocById($file_id);
        if (empty($file_data)) {
            echo "File not found";
        }
        $fileContent = $file_data['varFileBody'];
        $fileContentDecoded = base64_decode($fileContent);
        unset($fileContent);
        if (!empty($file_data)) {
                header('Content-Type: application/pdf');
            echo $fileContentDecoded;
            die;
        }


}

    public function onDownloadFile($file_id)
    {;
        $result = $this->filesTable->getDocById($file_id);
        $fileContentDecoded = base64_decode($result->varFileBody);
        $fileName = $result->varFileName;
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename=' . $fileName);
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
        echo $fileContentDecoded;
        die;
    }


}
