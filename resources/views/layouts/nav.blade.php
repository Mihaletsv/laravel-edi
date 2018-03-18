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
<div class="navbar navbar-default navbar-fixed-top" role="navigation"  id="navhead">
    <div class="alert_info_mes">
        @include('errors.errlist')
        @include('flash::message')
    </div>
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
                                        Выйти
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
<script src="/js/signCertificate.js"></script>
<script src="/js/CryptoApplet/CryptoAppletInit.js"></script>
<script src="/js/CryptoApplet/CryptoProModule.js"></script>
<script src="/js/CryptoApplet/CryptoProAsync.js"></script>
<script src="/js/CryptoApplet/CryptoProAPI.js"></script>






<script>

    $( '#signVerifyButton' ).click(function(e) {
            setTimeout('FillCertificateList(true)', 1000);


    }
    );
    Notify = {
        TYPE_INFO: 0,
        TYPE_SUCCESS: 1,
        TYPE_WARNING: 2,
        TYPE_DANGER: 3,
        generate: function (aText, Type_int) {
            var lTypeIndexes = [this.TYPE_INFO, this.TYPE_SUCCESS, this.TYPE_WARNING, this.TYPE_DANGER];
            var ltypes = ['alert-info', 'alert-success', 'alert-warning', 'alert-danger'];
            var ltype = ltypes[this.TYPE_INFO];

            if (Type_int !== undefined && lTypeIndexes.indexOf(Type_int) !== -1) {
                ltype = ltypes[Type_int];
            }
            var lText = '';
            lText += "<p>"+aText+"</p>";
            var lNotify_e = $("<div class='alert_info_mes alert "+ltype+"'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>×</span></button>"+lText+"</div>");
            setTimeout(function () {
                lNotify_e.alert('close');
            }, 100000);
            lNotify_e.appendTo($("#navhead"));
        }
    };

    //Notify.generate('Текст уведомления', 0);
$('div.alert').not('.alert-important').delay(3000).slideUp(300);
function fileUp() {
                $('#file_upload').trigger('click');
            }

            function deleteRecRow(elem) {
                elem.closest('.input-group').remove();
            }
            function clearMyModel() {
                $('.addrec').val('');
                $('#recDivRows').children(".input-group").each(function (i) {
                    if (i > 0)
                    {

                        this.remove();
                    }
                })
            }
        function clearMyModelAdmin() {
            $('.addrecAdmin').val('');
            $('#recAdminDivRows').children(".input-group").each(function (i) {
                this.remove();
            });
            var file_id = $('#file_id').val();
            $.ajax({
                url: '{{route('getadmins')}}',
                method: 'POST',
                data: {'file_id': file_id, '_token': $('meta[name="csrf-token"]').attr('content')},
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            $('#recAdminDivRows').append(
                                $('#rec_template').html()
                                    .replace(/%key%/g,
                                        i));
                            $('#recAdminDivRows').find("#recipient"+i).val(data[i].email);
                        }
                    }
                    else
                    {
                        $('#recAdminDivRows').append(
                            $('#rec_template').html()
                                .replace(/%key%/g,
                                    0));
                    }
                },
                error: function (msg) {
                    console.log(msg);
                }
            });

            }


            $( '#signButton' ).click(function(e) {
                var div_id = $('#certificate');
                if (div_id.hasClass('hide')) {
                    $(div_id).removeClass('hide');
                    setTimeout('FillCertificateList()', 1000);
                }
                else
                {
                    $(div_id).addClass('hide');
                }
            });
            $( '.list-group-item' ).click(function(e) {
                var div_id = $(this).next();
                if (div_id.hasClass('hide')) {
                    if (div_id.hasClass('accessList')) {
                        $('#accessList h6').remove();
                        var file_id = $(this).data('file_id');
                        $.ajax({
                            url: '{{route('getaccess')}}',
                            method: 'POST',
                            data: {'file_id': file_id, '_token': $('meta[name="csrf-token"]').attr('content')},
                            dataType: 'json',
                            success: function (data) {
                                if (data.length > 0) {
                                    for (var i = 0; i < data.length; i++) {
                                        if (data[i].varUser)
                                            $('#accessList').append('<h6>' + data[i].varUser + ' (' + data[i].varUserEmail + ')</h6>');
                                    }
                                }
                                else
                                {
                                    $('#accessList').append('<h6 style="margin-top: 100px">Доcтупен только автору</h6>');
                                }
                            },
                            error: function (msg) {
                                console.log(msg);
                            }
                        });
                    }
                    $(div_id).removeClass('hide');

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
            );

            $('.btnaddrecAdmin').click(function () {
                var elem_id = $('#recAdminDivRows .input-group:last');
                elem_id.after(
                    $('#rec_template').html()
                        .replace(/%key%/g,
                            elem_id.children('.form-control').data('key') + 1));
            });

        function getCertExpInfo(cert_selector)
            {
                var selector_object = $(cert_selector.options[cert_selector.selectedIndex]);
                var certData = selector_object.data('certData'); //Get certData array from selector object

                if (typeof certData == 'undefined') return;
                var expDate = new Date(certData.expireDate);
                var currDate = new Date();

                var due = new Date(expDate - currDate),
                    dueYear = expDate.getFullYear() - currDate.getFullYear(),
                    dueMonth = due.getMonth(),
                    dueDay = due.getDate();

                if (dueYear > 0 && ((expDate.getMonth() - currDate.getMonth()) > 0) || dueYear > 0 && ((expDate.getMonth() - currDate.getMonth()) == 0) && ((expDate.getDate() - currDate.getDate()) > 0)) {
                    var moreThanYear = true;
                }

                var certExpDays = $(cert_selector).closest('div').find('#certExpDays')[0];
                if (certExpDays && !dueMonth) {
                    certExpDays.innerHTML = 'Срок действия сертификата истекает через ' + (moreThanYear ? dueYear + ' год ' : '') + (dueMonth ? dueMonth + ' месяцев ' : '') + dueDay + ' дней. Обратитесь в ваш удостоверяющий центр для продления сертификата.';
                } else if (certExpDays) {
                    certExpDays.innerHTML = '';
                }
            }
    {{--            @if ($sign_data)
    var sign = $('#SignTxtBox').val();
    var data = $('#FileTxtBox').val();
    CryptoProModule.VerifySignCades(sign, data).then(function(verify){
        if (!verify.error) {
            console.log("Результат провери подписи: " + verify);
        }
        else {
            console.log(verify.error);
        }
    });
    @endif --}}
        </script>

</body>
</html>