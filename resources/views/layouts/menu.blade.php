<div class="col-sm-4 navbar-fixed-top navbar-menu" >
                    <div class="panel panel-primary text-center">
                        <div class="panel-heading">
                            <h3 class="panel-title">Меню</h3>
                        </div>
                        <div class="panel-body">
                                @auth
                                    <form name="uploadFile" class="form-horizontal" method="POST" action="{{ route('uploadfile') }}"
                                          enctype="multipart/form-data">
                                        {{ csrf_field() }}
                                        <a class="btn btn-lg btn-primary" onclick="fileUp()" role="button">Загрузить файл</a>
                                        <input class="hide" id="file_upload" type="file" name="file_upload"
                                               onchange="uploadFile.submit();">
                                    </form>
                                @endauth
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('home')}}'">
                            Мои документы
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('docs','inbox')}}'">
                            Входящие
                        </div>
                        <div class="panel-body menu" onclick="window.location.href='{{route('docs','outbox')}}'">
                            Отправленные
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

