// Small script to count unique characters from an input text
#include<stdio.h>
#include<string.h>
int main(int argc, char* argv[])
{
    char* str = "";
    int i,j,l;
    char c;
    for(i = 1; i < argc; i++)
    {
        l = strlen(argv[i]);
        for(j = 0; j < l; j++)
        {
            c = argv[i][j];
            if(strchr(str, c) == NULL)
            {
                asprintf(&str, "%s%c", str, c);
            }
        }
    }
    printf("deduped: %s\n", str);
    return 0;
}
