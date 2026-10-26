# SSO-UI.JS

## Notes about CAS version

CAS1 support is implemented* but has not been confirmed against the UI SSO service, literally copied all that. Maybe going to remove it instead. Example uses CAS2.

For CAS4, no implementation yet. 

Service tickets are single-use and tied to the service URL used to request them. Validate each ticket ONCE, using the same service URL as the login request.

## About kd_org

`kd_org`, or referred as organization code, is a code that tells a user's major, department, and faculty.

It seems arbitrary but its structured this way:
```
major.department.faculty.01

ex:
01.00.12.01
|  |  |
|  |  '-> Faculty of Computer Science
|  '-> No department; Faculty-leved probably
'-> Bachelor of Computer Science

01.01.03.01
|  |  |
|  |  '-> Faculty of Mathematics and Natural Science
|  '-> Department of Mathematics
'-> Bachelor of Mathematics
```

I have no idea what that `.01` means. 

https://git.fossy.my.id/femboy/kd_org

(kd_org is kinda weird and funny honestly so i wanna write more about it later)

## Acknowledgments

- [ristekoss/sso-proxy](https://github.com/ristekoss/sso-proxy), 2022.
- [ristekoss/rust-sso-ui-jwt](https://github.com/ristekoss/rust-sso-ui-jwt), 2022, MIT.
- [ristekoss/golang-sso-ui-jwt](https://github.com/ristekoss/golang-sso-ui-jwt), 2021, MIT.
- [rkkautsar/sso-ui](https://github.com/rkkautsar/sso-ui), 2016, MIT.
- [ristekoss/SSO](https://github.com/ristekoss/SSO), 2015.

