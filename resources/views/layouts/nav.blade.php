<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <!-- Custom styles for this template -->
    <link href="{{ asset('css/custom.css') }}" rel="stylesheet">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="../../assets/ico/favicon.ico">
    <meta name="csrf-token" content="{!! csrf_token() !!}" />
    <title>DocsignEx</title>
</head>
<body>
<div class="navbar navbar-default navbar-fixed-top" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/">DocsignEx</a>
        </div>
        <div class="navbar-collapse collapse" >
            <ul class="nav navbar-nav @guest hide @endguest">
                <li class="nav-head"><a href="{{route('home')}}">Home</a></li>
                <li  class="nav-head"><a href="#">Контакты</a></li>
                <li class="dropdown nav-head">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">Группы<b class="caret"></b></a>
                    <ul class="dropdown-menu">
                        <li><a href="#">Создать группу</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                    </ul>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                @guest
                    <li class="nav-head"><a href="{{ route('login') }}">Вход</a></li>
                    <li class="nav-head"><a href="{{ route('register') }}">Регистрация</a></li>
                    @else
                        <li class="dropdown nav-head">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false" aria-haspopup="true">
                                {{ Auth::user()->name }} <span class="caret"></span>
                            </a>

                            <ul class="dropdown-menu">
                                <li>
                                    <a href="{{ route('logout') }}"
                                       onclick="event.preventDefault();
                                                     document.getElementById('logout-form').submit();">
                                        Logout
                                    </a>

                                    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                        {{ csrf_field() }}
                                    </form>
                                </li>
                            </ul>
                        </li>
                        @endguest
            </ul>
        </div>
    </div>
</div>
@yield('content')
<script src="/js/app.js"></script>
        <script>
            function fileUp() {
                $('#file_upload').trigger('click');
            }

            function deleteRecRow(elem) {
                elem.closest('.input-group').remove();
            }
            function clearMyModel() {
                $('.addrec').val('');
                $('.input-group').each(function (i) {
                    if (i > 1)
                    {
                        this.remove();
                    }
                })
            }
            $( '.list-group-item' ).click(function(e) {
                var div_id = $(this).next();
                if (div_id.hasClass('hide')) {
                    if (div_id.hasClass('accessList')) {
                        $('#accessList h6').remove();
                        var fileid = $(this).data('fileid');
                        $.ajax({
                            url: '{{route('getaccess')}}',
                            method: 'POST',
                            data: {'fileid': fileid, '_token': $('meta[name="csrf-token"]').attr('content')},
                            dataType: 'json',
                            success: function (data) {
                                if (data.length > 0) {
                                    for (var i = 0; i < data.length; i++) {
                                        $('#accessList').append('<h6>' + data[i].varUser + ' (' + data[i].varUserEmail + ')</h6>');
                                    }
                                }
                            },
                            error: function (msg) {
                                console.log(msg);
                            }
                        });
                    }
                    $(div_id).removeClass('hide')

                }
                else
                {
                    $(div_id).addClass('hide');
                }
            });

            $('.btnaddrec').click(function () {
                var elem_id = $('#recDivRows .input-group:last');
                elem_id.after(
                    $('#rec_template').html()
                        .replace(/%key%/g,
                            elem_id.children('.form-control').data('key') + 1));
            });
            $('.nav-head').hover(
                function(){ $(this).addClass('active') },
                function(){ $(this).removeClass('active') }
            )
        </script>

</body>
</html>