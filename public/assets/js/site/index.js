askUserByAlert(
    '.delete-book', 
    '¿Estas seguro de que deseas eliminar este libro?'
)


askUserByAlert(
    '.delete-author', 
    '¿Estas seguro de que deseas eliminar este autor?'
)
   

askUserByAlert(
    '.delete-category', 
    '¿Estas seguro de que deseas eliminar esta categoría?'
)

askUserByAlert(
    '.delete-editorial', 
    '¿Estas seguro de que deseas eliminar este editorial?'
)


askUserByAlertRedirect(
    '.log-out', 
    '¿Estas seguro de que deseas cerrar sesión?'
)

function askUserByAlert(idButton, message){
    $(document).ready(function () {
        $(idButton).on('click', function (e) {
           e.preventDefault();
           const form = $(this).closest('form');
           if (confirm(message)){
               form.submit();
           }
        });
       });
}

function askUserByAlertRedirect(idButton, message){
    $(idButton).on('click', function (e) {
        e.preventDefault();
        targetHref = $(this).attr('href'); 
        if (confirm(message)){
            window.location.href = targetHref;
        }
    });
}