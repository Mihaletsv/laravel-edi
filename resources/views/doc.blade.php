@include('modal.modal')
@extends('layouts.nav')
@extends('layouts.menu')
    @section('content')
                <div class="col-sm-4" style="padding-top:80px; padding-left:300px; width: 100%; min-height: 500px;">
                    <div class="panel panel-success">
                        <div class="panel-heading">
                            <h3 class="panel-title">
                                <a href="{{ route('downloadfile',['file_id'=> $file_id,'doc_id'=> $doc_id]) }}" class="btn btn-sm btn-success">
                                    Скачать</a>
                                <a href="#" id="signButton" class="btn btn-sm btn-success">
                                    Подписать</a>
                                <a href="#myModal" onclick="clearMyModel()" class="btn btn-sm btn-success" data-toggle="modal">
                                    Отправить</a>
                                <a href="#myModalAdmin" onclick="clearMyModelAdmin()" class="btn btn-sm btn-success" data-toggle="modal">
                                    Администраторы</a>
                            </h3>
                        </div>
                        <div class="panel-body hide" id="certificate">
                            Cертификат:
                                    <select style="width: 460px;" id="cert_selector_0" class="cert_selector" onchange="getCertExpInfo(this)" defaultthumb="">
                                        </select>
                            <a href="#" class="btn btn-sm btn-success"  onclick="CreateDetachedSignFile('{{route('getpdf')}}')">
                                Подписать</a>
                            {!! Form::open(['route' => ['getpdf'], 'name' => 'signForm', 'id' => 'signForm']) !!}
                            {!! Form::hidden('event', "sign", ['class'=>'hide']) !!}
                            {!! Form::hidden('intFileID', "{$file_id}", ['id'=>'intFileID']) !!}
                            {!! Form::hidden('intDocID', "{$doc_id}", ['id'=>'intDocID']) !!}
                            {!! Form::close() !!}

                            <span id="certExpDays"></span>
                        </div>
                        <div class="panel-body">
                            <iframe src="{{ route('browsefile',['file_id'=> $file_id]) }}" width="66%" height="70%" seamless
                                    style="float: left;">
                            </iframe>
                            <div class="col-xs-6 col-sm-4" id="sidebar" role="navigation">
                        <ul class="nav text-center">
                            @if (!$doc_id)
                                <li class="active">
                                    <a href="#" class="list-group-item">Биллинг</a>
                                    <div class="row" style="min-height: 200px;">
                                        @if ($doc_data)
                                            @foreach ($doc_data as $key => $bill)
                                                <h6>{{$key+1}}: {{$bill['sender_data']['name']}} -> {{$bill['recipient_data']['name']}}</br>{{$bill['created_at']}}</h6>
                                            @endforeach
                                        @else
                                            <h6 style="margin-top: 100px">Нет документов по этому файлу</h6>
                                        @endif
                                    </div>
                                </li>
                                <li>
                                    <a href="#" class="list-group-item" data-file_id="{{$file_id}}">Получатели файла</a>
                                    <div class="row hide accessList" id="accessList" style="height: 200px;"><h6 style="margin-top: 100px">Доcтупен только автору</h6></div>
                                </li>
                            @else
                                <li class="active">
                                    <a href="#" class="list-group-item">Подпись</a>
                                    <div class="row" style="min-height: 200px;">
                                            @if ($sign_data)
                                            <h6 title="ФИО подписанта">{{$sign_data['cert_data']['surname']}} {{$sign_data['cert_data']['name']}} {{$sign_data['cert_data']['patronymic']}}</h6>
                                            <h6 title="Организация">{{$sign_data['cert_data']['organizationName']}}</h6>
                                            <h6 title="Должность подписанта">{{$sign_data['cert_data']['title']}}</h6>
                                            <h6 title="Серийный номер">{{$sign_data['cert_data']['serial']}}</h6>
                                            <h6 title="Дата подписания">{{$sign_data['cert_data']['signDate']}}</h6>
{{--                                            <a href="#" id="signVerifyButton" class="btn btn-sm btn-success">
                                                Проверить подпись</a>--}}
                                                @if ($sign_data['isValid'])
                                                    <h5 class="text-success sbold">Подпись верна</h5>
                                                @else
                                                    <h5 class="text-danger sbold">Подпись не верна</h5>
                                                @endif
                                            @else
                                            <h6 style="margin-top: 100px">Документ никем не подписан</h6>
                                            @endif
                                    </div>
                                </li>
                                <li>
                                    <a href="#" class="list-group-item" data-file_id="{{$file_id}}">Информация</a>
                                    <div class="row hide accessList" id="infoList" style="min-height: 200px;">
                                        @if (!$doc_data->recipient_id)
                                            <h6 style="margin-top: 100px">Это черновик</h6>
                                            @endif
                                    </div>
                                </li>
{{--                                <input type="hidden" id="FileTxtBox" value="{{$sign_data['baseContent']}}">
                                <input type="hidden" id="SignTxtBox" value="{{$sign_data['baseSignContent']}}">--}}
                            @endif

                        </ul>
                            </div>
                        </div>

                    </div>
                </div>
    @endsection
<script>

</script>