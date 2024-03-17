var cookieAlert = document.getElementById("cookie-alert");

if (GetCookieValue("cookie_consent") != "consent") {
  setTimeout(function () {
    cookieAlert.classList.add("show");
  }, 1500);
}

// Primeiro parâmetro (element): botão
// Outros argumentos: inputs do form
function SetLoading(button) {
  for (var i = 1; i < arguments.length; i++) {
    // console.log(arguments[i].value);
    if (arguments[i].value == "" || arguments[i].value == null) {
      return false;
    }
  }

  width = button.offsetWidth;
  height = button.offsetHeight;

  button.innerHTML =
    '<div class="spinner-border text-light spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>';
  button.style.width = width + "px";
  button.style.height = height + "px";
}

function DisableButton(button) {
  button.disabled = true;
  return true;
}

function RemoveError(element) {
  element.classList.remove("input-error");
}

function ChangeArrow(element) {
  if (element.previousSibling.classList.contains("close")) {
    element.previousSibling.className = "fas fa-chevron-down";
  } else {
    element.previousSibling.className = "fas fa-chevron-down close";
  }
}

function SetCookie(name, value, expireDays) {
  var d = new Date();
  d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function GetCookieValue(name) {
  var name = name + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function SetCookieConsent() {
  SetCookie("cookie_consent", "consent", 365 * 5);
}

function CopyUrlToClipboard() {
  var dummy = document.createElement("input"),
    text = window.location.href;

  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);

  LaunchToast("Link copiado para a área de transferência!");
}

function LaunchToast(text, color = "green") {
  if (color == "red") {
    document.getElementById("toast").classList.add("toast-red");
  } else {
    document.getElementById("toast").classList.remove("toast-red");
  }

  document.querySelector(".toast-body").innerHTML = text;
  $("#toast").toast("show");
}
