function Validator(options) {

    var api = 'http://localhost:3000/client';

    var getParent = function (element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    //Lấy ra form 
    var formElement = document.querySelector(options.form)
    var rulesObjects = {};

    formElement.onsubmit = function (e) {
        e.preventDefault();
        var re = true;

        options.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector)
            re = validate(inputElement, rule);
        })
        if (re === true) {

            var inputValues = formElement.querySelectorAll('[name]:not(disable)')
            var datas = Array.from(inputValues).reduce(function (values, input) {

                switch (input.type) {
                    case 'radio':
                        if (input.matches(':checked')) {
                            values[input.name] = input.value;
                        }
                        break;

                    default: values[input.name] = input.value;
                        break;
                }

                return values;
            }, {})
            postData(datas);
            alert("Đã lưu sữ liệu vào database")
        }
        else {
            alert("false")
        }

    }

    function postData(datas) {
        fetch(api,{
            method:'POST',
            body: JSON.stringify({
                email: datas.email,
                gender: datas.gender,
                name: datas.fullname,
                password: datas.password,
                password_confirmation: datas.password_confirmation
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(json => console.log(json));
    }
    function getData() {
        fetch(api)
        .then(function (response) {
            return response.json();
        })
        .then(function (clients) {
            renderData(clients);
        });
    }
    function renderData(clients) {
        var htmls = ''
        var value = clients.forEach(function (data) {
            
            htmls += `<table class="table">
                      <tr>
                      <td>Name</td>
                      <td>${data.name}</td>
                      </tr>
                      <tr>
                      <td>Email</td>
                      <td>${data.email}</td>
                      </tr>
                      <tr>
                      <td>Password</td>
                      <td>${data.password}</td>
                      </tr>
                      <tr>
                      <td>Gender</td>
                      <td>${data.gender}</td>
                      </tr>
                      </table>`
        });
        var blockTable = document.getElementById('tableBlock');
        blockTable.innerHTML = htmls;
    }
    //Lấy ra các input elements
    options.rules.forEach(function (rule) {

        if (Array.isArray(rulesObjects[rule.selector])) {
            rulesObjects[rule.selector].push(rule.test)
        }
        else {
            rulesObjects[rule.selector] = [rule.test]
        }

        var inputElement = formElement.querySelector(rule.selector)

        inputElement.onblur = function () {
            validate(inputElement, rule);
        }

    });

    function validate(inputElement, rule) {
        var result = true;
        var rules = rulesObjects[rule.selector]
        for (let i = 0; i < rules.length; i++) {
            var messageError = rules[i](inputElement.value)
            if (messageError) {
                break;
            }
        }
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
        if (messageError) {
            result = false;
            errorElement.innerText = messageError
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
            inputElement.oninput = function () {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        return result;
    }
        var button = document.getElementById('button');
        button.onclick = function () {
            getData()
        }
}

// options:

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Required fill full'
        }
    }
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : message || 'Required email'
        }
    }
}
Validator.isPassword = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value >= 6 ? undefined : message || `Required password more ${min} charactor`;
        }
    }
}
Validator.passwordComfirm = function (selector, getcomfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getcomfirmValue() ? undefined : message || "Password incorrect"
        }
    }
}