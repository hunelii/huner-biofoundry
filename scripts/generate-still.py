from pathlib import Path
import numpy as np
from PIL import Image
n=160
rng=np.random.default_rng(2718)
a=np.ones((n,n),np.float32); b=np.zeros_like(a)
y,x=np.mgrid[:n,:n]
for _ in range(12):
 cx,cy=80+rng.uniform(-10,10),80+rng.uniform(-10,10)
 mask=(x-cx)**2+(y-cy)**2<rng.uniform(3,6)**2
 a[mask]=.48;b[mask]=.32
for i in range(800):
 def lap(v):
  return -v+.2*(np.roll(v,1,0)+np.roll(v,-1,0)+np.roll(v,1,1)+np.roll(v,-1,1))+.05*(np.roll(np.roll(v,1,0),1,1)+np.roll(np.roll(v,1,0),-1,1)+np.roll(np.roll(v,-1,0),1,1)+np.roll(np.roll(v,-1,0),-1,1))
 reaction=a*b*b
 a,b=np.clip(a+lap(a)-reaction+.0367*(1-a),0,1),np.clip(b+.48*lap(b)+reaction-(.0649+.0367)*b,0,1)
t=np.clip((b-.13)/(.32-.13),0,1);t=t*t*(3-2*t)
img=np.zeros((n,n,4),np.uint8);img[:,:,:3]=[34,49,29];img[:,:,3]=(t*230).astype(np.uint8)
Image.fromarray(img).save(Path(__file__).parents[1]/'public/colony-still.png')
print('Saved deterministic reaction-diffusion still; active pixels:',int((b>.13).sum()))
