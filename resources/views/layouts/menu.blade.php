<div class="col-sm-4 navbar-fixed-top navbar-menu" >
                    <div class="panel panel-primary text-center">
                        <div class="panel-heading">
                            <h3 class="panel-title">Меню</h3>
                        </div>
                        <div class="panel-body">
                                @auth
                                {!! Form::open(['route' => 'uploadfile', 'name' => 'uploadFile', 'enctype' => 'multipart/form-data']) !!}
                                <a class="btn btn-lg btn-primary" onclick="fileUp()" role="button">Загрузить файл</a>
                                {!! Form::file('file_upload', ['class'=>'hide', 'id'=>'file_upload', 'onchange' => 'uploadFile.submit();']) !!}
                                {!! Form::close() !!}
                                @endauth
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('home')}}'">
                            Мои файлы
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('docs','inbox')}}'">
                            Входящие
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('docs','outbox')}}'">
                            Отправленные
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('docs','draft')}}'">
                            Черновики
                        </div>
                        <div class="panel-body menu">
                            Удаленные
                        </div>
                        <div class="panel-body menu">
                            Важные
                        </div>
                        <div class="panel-body menu">
                            Группы
                        </div>
                    </div>
                </div>

