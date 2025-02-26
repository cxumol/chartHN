## Viewer

<https://cxumol.github.io/chartHN/>

## Architecture

```
                                ┌────────────────┐                             
                                │                │                             
         ┌──────────────────────┼   Git Branch   ┼────────────────────┐        
         │                      │                │                    │        
         │                      └───────┬────────┘                    │        
         │                              │                             │        
         │                              │                             │        
         ▼                              ▼                             ▼        
  ┌────────────┐                ┌──────────────┐               ┌─────────────┐ 
  │            │                │              │               │             │ 
  │   master   │                │     data     │               │   gh-pages  │ 
  │            │                │              │               │             │ 
  └──────┬─────┘                └───────┬──────┘               └──────┬──────┘ 
         │                              │                             │        
         │                              │                             │        
         │                              │                             │        
   ┌─────▼───┐    github         ┌──────▼─────┐      CDN      ┌───────▼─────┐  
   │ .sh .js │      actions      │ .tsv .json ┼───────────────► plain .html │  
   │ scripts ┼───────────────────►    data    │               └─────────────┘  
   └─────────┘                   └────────────┘                                
                                                                               
```

## Acknowledgement

- https://github.com/cxumol/dot-minify
- https://r.jina.ai/
- https://api.github.com/repos/headllines/hackernews-daily/issues
- https://viz-js.com/api/
- https://github.com/dohliam/dropin-minimal-css
