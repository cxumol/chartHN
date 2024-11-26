mkdir -p ../chartHN_tmp
mv .env ../chartHN_tmp/ || echo "no .env"
# mv data ../chartHN_tmp/
rsync -av data/ ../chartHN_tmp/


git checkout data
git rm -r --cached .
# Move contents of data to the root, handling subdirectories correctly. -a preserves attributes
cp -r ../chartHN_tmp/data ./
git add .
git commit -m "manual update $(date +%Y-%m-%d)"
git push