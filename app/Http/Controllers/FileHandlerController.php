<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Auth;

class FileHandlerController extends HomeController
{
    public function onUploadFile(Request $request)  {
        $file = $request->file('file_upload');
        $fileName = $file->getClientOriginalName();
        $fileBody = file_get_contents($file->getRealPath());
        $this->filesTable->user_id = Auth::id();
        $this->filesTable->varFileName = $fileName;
        $this->filesTable->varFileBody = base64_encode($fileBody);
        $this->filesTable->save();
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
            $ext = $this->getFileExt($file_data['varFileName']);
            if ($ext == 'pdf') {
                header('Content-Type: application/pdf');
            } else {
                header('Content-Type: image');
            }
            echo $fileContentDecoded;
            die;
        }


}

    public function onDownloadFile($file_id)
    {
        $noaccess = false;
        if (!empty($noaccess)) {
            echo "У Вас нет прав на загрузку этого файла. Обратитесь к его владельцу";
            exit();
        }
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

    private function getFileExt($filename)
    {
        $temp = explode('.', $filename);
        return strtolower(end($temp));
    }

}
