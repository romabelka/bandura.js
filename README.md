
## Bandura.js

* [Install](#install)
  * [CSS](#add-css)
  * [Add Javascript](#add-javascript)

### Install

#### Add CSS

At first add icons to your page. Icons exist in `public/fonts/`.
Add fonts to your server and add next styles to your css, before replacing
`[path-to-yor-fonts]/` real path on your server.

```css
@font-face {
  font-family: 'new_player_icons';
  src: url("[path-to-yor-fonts]/new_player_icons.eot");
  src:
    url("[path-to-yor-fonts]/new_player_icons.eot#iefix")
      format("embedded-opentype"),
    url("[path-to-yor-fonts]/new_player_icons.woff")
      format("woff"),
    url("[path-to-yor-fonts]/new_player_icons.ttf")
      format("truetype"),
    url("[path-to-yor-fonts]/new_player_icons.svg#fontello")
      format("svg");
  font-weight: normal;
  font-style: normal;
}
```

#### Add Javascript
