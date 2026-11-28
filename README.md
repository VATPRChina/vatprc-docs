# vatprc-docs

This is the repository for VATPRC's website.

## Contributing

See the [pull request guide](.github/CONTRIBUTING.md) for which template to use.

### Docs / SOP

The docs are placed under `docs/`. All markdown documents there are immediately
available on our website under <https://www.vatprc.net/docs>, despite there is no
listing for all docs.

SOP pull requests automatically request review from
[Aaron Liu (1478665)](https://github.com/AaronZSAM101). When Aaron authors the
pull request, [Jingyuan Yin (1478847)](https://github.com/JingyuanYin) reviews it
instead. [Shengbo Yang](https://github.com/klc05) remains a reviewer for final
review.

#### Image

This repository recommends against placing static assets inside the repository.
Please use an online image service, and include the absolute link to it.

- For VATPRC staff, you may use <https://www.vatprc.net/docs/utils/image>.
- For others, please use an online image CDN service.

#### GeoJSON maps

In repository or Discourse Markdown, use a fenced `geojson` block to embed an
interactive map. Coordinates are in longitude, latitude order. Each block accepts
a geometry, Feature, or FeatureCollection, including multi-geometries and
GeometryCollections. Invalid JSON or geometry appears as an ordinary code block.

````markdown
```geojson
{
  "type": "Feature",
  "properties": { "name": "Beijing Capital International Airport" },
  "geometry": { "type": "Point", "coordinates": [116.5975, 40.0799] }
}
```
````

### Website

See [README](./website/README.md).

### UniAPI

See [README](./uniapi/README.md).

## License

&copy; 2010 - 2026, [VATSIM P.R. China Division](https://www.vatprc.net), All rights reserved.
